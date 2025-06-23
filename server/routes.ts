import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { storage } from "./storage";
import { upload, saveUploadedFile, getImageDimensions, convertToBase64 } from "./services/upload";
import { analyzeImageForTattoo, streamChatResponse, createTattooPrompt } from "./services/openai";
import { generateTattooStencil } from "./services/replicate";
import { nanoid } from "nanoid";
import Stripe from "stripe";
import express from "express";
import path from "path";

// Initialize Stripe if keys are available
let stripe: Stripe | undefined;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Image upload route
  app.post('/api/upload', isAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user.claims.sub;
      const { buffer, originalname, mimetype } = req.file;

      // Save file and get dimensions
      const fileData = await saveUploadedFile(buffer, originalname, mimetype);
      const dimensions = await getImageDimensions(buffer);

      // Create image record
      const image = await storage.createImage({
        id: nanoid(),
        ownerId: userId,
        url: fileData.url,
        filename: fileData.filename,
        size: fileData.size,
        width: dimensions.width,
        height: dimensions.height,
        meta: { mimetype, originalName: originalname }
      });

      res.json({
        id: image.id,
        url: image.url,
        filename: image.filename,
        size: image.size,
        width: image.width,
        height: image.height
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Chat with AI assistant
  app.post('/api/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { message, imageId } = req.body;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Check if OpenAI API key is properly configured
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith('r8_')) {
        return res.status(503).json({ 
          message: "AI chat service requires OpenAI API key configuration",
          error: "service_unavailable"
        });
      }

      // Save user message
      await storage.createChatMessage({
        id: nanoid(),
        userId,
        imageId: imageId || null,
        role: 'user',
        content: message
      });

      // Get chat history
      const chatHistory = await storage.getUserChatMessages(userId, imageId);
      const messages = chatHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

      // Get image data if provided
      let imageBase64: string | undefined;
      if (imageId) {
        const image = await storage.getImage(imageId);
        if (image) {
          // In a real implementation, you'd read the file and convert to base64
          // For now, we'll skip this step
        }
      }

      // Stream response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const stream = await streamChatResponse(messages, imageBase64);
      const reader = stream.getReader();

      let assistantResponse = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          res.write(chunk);

          // Extract content for saving
          if (chunk.includes('data: ')) {
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.content) {
                    assistantResponse += data.content;
                  }
                } catch (e) {
                  // Ignore JSON parse errors
                }
              }
            }
          }
        }

        // Save assistant response
        if (assistantResponse) {
          await storage.createChatMessage({
            id: nanoid(),
            userId,
            imageId: imageId || null,
            role: 'assistant',
            content: assistantResponse
          });
        }

        res.end();
      } catch (error) {
        console.error("Streaming error:", error);
        res.write(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`);
        res.end();
      }
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Failed to process chat" });
    }
  });

  // Analyze image with AI
  app.post('/api/analyze-image', isAuthenticated, async (req: any, res) => {
    try {
      const { imageId, prompt } = req.body;
      const userId = req.user.claims.sub;

      if (!imageId) {
        return res.status(400).json({ message: "Image ID is required" });
      }

      const image = await storage.getImage(imageId);
      if (!image || image.ownerId !== userId) {
        return res.status(404).json({ message: "Image not found" });
      }

      // Read image file and convert to base64
      const imagePath = path.join(process.cwd(), 'uploads', path.basename(image.url));
      const fs = require('fs').promises;
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = convertToBase64(imageBuffer);

      const analysis = await analyzeImageForTattoo(base64Image, prompt);

      res.json({ analysis });
    } catch (error) {
      console.error("Image analysis error:", error);
      res.status(500).json({ message: "Failed to analyze image" });
    }
  });

  // Generate tattoo stencil
  app.post('/api/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { prompt, imageId, settings } = req.body;

      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      // Check user credits
      const user = await storage.getUser(userId);
      if (!user || user.credits < 5) {
        return res.status(402).json({ message: "Insufficient credits" });
      }

      let referenceImageUrl: string | undefined;
      let baseImage: any = null;

      if (imageId) {
        baseImage = await storage.getImage(imageId);
        if (baseImage && baseImage.ownerId === userId) {
          referenceImageUrl = `${req.protocol}://${req.get('host')}${baseImage.url}`;
        }
      }

      // Create enhanced prompt for tattoo generation
      const enhancedPrompt = await createTattooPrompt(prompt);

      // Generate image with Replicate
      const resultUrl = await generateTattooStencil(enhancedPrompt, referenceImageUrl, settings);

      // Create edit record
      const edit = await storage.createEdit({
        id: nanoid(),
        baseImageId: imageId || '',
        resultUrl,
        prompt,
        aiPrompt: enhancedPrompt,
        settings,
        creditCost: 5
      });

      // Deduct credits
      await storage.updateUserCredits(userId, user.credits - 5);

      res.json({
        id: edit.id,
        url: resultUrl,
        prompt: enhancedPrompt,
        creditsUsed: 5,
        creditsRemaining: user.credits - 5
      });
    } catch (error) {
      console.error("Generation error:", error);
      res.status(500).json({ message: "Failed to generate image" });
    }
  });

  // Get user's images
  app.get('/api/images', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const images = await storage.getUserImages(userId);
      res.json(images);
    } catch (error) {
      console.error("Error fetching images:", error);
      res.status(500).json({ message: "Failed to fetch images" });
    }
  });

  // Get user's edits/generations
  app.get('/api/generations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const edits = await storage.getUserEdits(userId);
      res.json(edits);
    } catch (error) {
      console.error("Error fetching generations:", error);
      res.status(500).json({ message: "Failed to fetch generations" });
    }
  });

  // Stripe routes (if configured)
  if (stripe) {
    // Create payment intent for credit purchase
    app.post("/api/create-payment-intent", isAuthenticated, async (req: any, res) => {
      try {
        const { amount, credits } = req.body;
        const paymentIntent = await stripe!.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: "usd",
          metadata: {
            userId: req.user.claims.sub,
            credits: credits.toString()
          }
        });
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error: any) {
        res.status(500).json({ message: "Error creating payment intent: " + error.message });
      }
    });

    // Stripe webhook for payment confirmation
    app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
      const sig = req.headers['stripe-signature'];
      
      if (!process.env.STRIPE_WEBHOOK_SECRET || !sig) {
        return res.status(400).send('Webhook signature verification failed');
      }

      try {
        const event = stripe!.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

        if (event.type === 'payment_intent.succeeded') {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          const userId = paymentIntent.metadata.userId;
          const credits = parseInt(paymentIntent.metadata.credits);

          if (userId && credits) {
            const user = await storage.getUser(userId);
            if (user) {
              await storage.updateUserCredits(userId, user.credits + credits);
            }
          }
        }

        res.json({ received: true });
      } catch (error: any) {
        console.error('Webhook error:', error.message);
        res.status(400).send('Webhook error: ' + error.message);
      }
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}
