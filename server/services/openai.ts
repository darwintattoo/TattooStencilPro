import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeImageForTattoo(base64Image: string, userPrompt?: string): Promise<string> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `You are a professional tattoo artist and AI assistant specializing in tattoo stencil design. 
      Analyze images and help users refine their tattoo concepts with expert advice on composition, style, placement, and artistic elements.
      Always provide specific, actionable suggestions for improving tattoo designs.`
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: userPrompt 
            ? `Please analyze this tattoo design and help me with: ${userPrompt}`
            : "Please analyze this tattoo design and provide professional suggestions for creating a tattoo stencil. Consider composition, line work, style, and any improvements that would make this a better tattoo."
        },
        {
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${base64Image}`
          }
        }
      ],
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    max_tokens: 1000,
    temperature: 0.7,
  });

  return response.choices[0].message.content || "I couldn't analyze the image. Please try again.";
}

export async function streamChatResponse(
  messages: { role: 'user' | 'assistant', content: string }[],
  imageBase64?: string
): Promise<ReadableStream> {
  const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `You are a professional tattoo artist and AI assistant for TattooStencilPro. 
      Help users create and refine tattoo stencil designs. Provide specific, actionable advice on:
      - Tattoo composition and design elements
      - Line work and style recommendations
      - Size and placement suggestions
      - Technical considerations for tattooing
      - Style adaptations (traditional, neo-traditional, realistic, etc.)
      
      Be encouraging and professional. Focus on creating designs that will translate well to tattoo stencils.`
    }
  ];

  // Add chat history
  messages.forEach(msg => {
    openaiMessages.push({
      role: msg.role,
      content: msg.content
    });
  });

  // Add image if provided
  if (imageBase64) {
    const lastMessage = openaiMessages[openaiMessages.length - 1];
    if (lastMessage.role === 'user' && typeof lastMessage.content === 'string') {
      lastMessage.content = [
        { type: "text", text: lastMessage.content },
        {
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
        }
      ];
    }
  }

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: openaiMessages,
    stream: true,
    max_tokens: 1000,
    temperature: 0.7,
  });

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            controller.enqueue(`data: ${JSON.stringify({ content })}\n\n`);
          }
        }
        controller.enqueue(`data: [DONE]\n\n`);
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });
}

export async function createTattooPrompt(userPrompt: string, imageAnalysis?: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert at creating detailed prompts for AI image generation specifically for tattoo stencils.
        Create a detailed, technical prompt that will generate high-quality tattoo stencil designs.
        
        Focus on:
        - Clean, bold line work suitable for tattooing
        - Professional tattoo art style
        - Black and white stencil format
        - Proper composition and flow
        - Technical details that ensure the design works as a tattoo
        
        Return only the refined prompt without explanations.`
      },
      {
        role: "user",
        content: `User request: ${userPrompt}${imageAnalysis ? `\n\nImage context: ${imageAnalysis}` : ''}`
      }
    ],
    max_tokens: 300,
    temperature: 0.7,
  });

  return response.choices[0].message.content || userPrompt;
}
