# TattooStencilPro

A professional AI-powered tattoo stencil generator that transforms your ideas into stunning, professional-quality tattoo designs.

## Features

- **AI-Powered Generation**: Advanced AI analyzes your concepts and creates professional tattoo stencils
- **Interactive Chat Assistant**: Get expert tattoo advice and refine your designs through conversation
- **Multiple Tattoo Styles**: Generate designs in traditional, neo-traditional, realistic, blackwork, and geometric styles
- **Image Upload & Analysis**: Upload reference images for AI analysis and enhancement
- **Advanced Settings**: Fine-tune generation parameters for perfect results
- **Credit System**: Fair usage system with flexible credit packages
- **Secure Authentication**: Powered by Replit Auth with user session management
- **Professional UI**: Dark theme with intuitive design focused on professional use

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Shadcn/UI components
- React Query for state management
- Wouter for routing
- React Dropzone for file uploads

### Backend
- Express.js with TypeScript
- PostgreSQL with Drizzle ORM
- Replit Auth for authentication
- OpenAI GPT-4o Vision for AI assistance
- Replicate FLUX Kontext PRO for image generation
- Stripe for payment processing
- Server-sent events for real-time chat

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
