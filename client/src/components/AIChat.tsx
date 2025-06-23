import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Send, Sparkles } from "lucide-react";
import { useChat } from "@/hooks/useChat";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  imageId?: string | null;
  onPromptChange?: (prompt: string) => void;
}

export default function AIChat({ imageId, onPromptChange }: AIChatProps) {
  const [message, setMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { messages, addMessage, streamResponse } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Extract the latest assistant message as prompt for generation
  useEffect(() => {
    const lastAssistantMessage = messages
      .filter(msg => msg.role === 'assistant')
      .pop();
    
    if (lastAssistantMessage && onPromptChange) {
      onPromptChange(lastAssistantMessage.content);
    }
  }, [messages, onPromptChange]);

  const sendMessage = async () => {
    if (!message.trim() || isStreaming) return;

    const userMessage = message.trim();
    setMessage("");
    
    // Add user message
    addMessage({
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    setIsStreaming(true);

    try {
      await streamResponse(userMessage, imageId || undefined);
    } catch (error: any) {
      console.error('Chat error:', error);
      let errorMessage = "Failed to get response from AI assistant";
      
      if (error.message?.includes('401') || error.message?.includes('invalid_api_key')) {
        errorMessage = "AI service requires proper API key configuration";
      } else if (error.message?.includes('429')) {
        errorMessage = "Too many requests. Please wait a moment and try again";
      } else if (error.message?.includes('500')) {
        errorMessage = "Server error. Please try again in a moment";
      }
      
      toast({
        title: "Chat Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const analyzeImage = () => {
    // This would trigger image analysis
    toast({
      title: "Feature Coming Soon",
      description: "Image analysis will be available in the next update",
    });
  };

  return (
    <Card className="bg-slate-700 border-slate-600">
      {/* Chat Header */}
      <CardHeader className="border-b border-slate-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="text-white h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">AI Assistant</h2>
              <p className="text-sm text-slate-400">
                {isStreaming ? "Thinking..." : "Ready to help with your tattoo design"}
              </p>
            </div>
          </div>
          <Button
            onClick={analyzeImage}
            className="bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Analyze Image
          </Button>
        </div>
      </CardHeader>

      {/* Chat Messages */}
      <CardContent className="p-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400">
                Hi! I'm your AI tattoo assistant. Upload an image or describe your tattoo concept, and I'll help you create the perfect design.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${
                  msg.role === 'user' ? 'justify-end' : ''
                }`}
              >
                {msg.role === 'assistant' && (
                  <Avatar className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600">
                    <AvatarFallback>
                      <Bot className="h-4 w-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`rounded-2xl p-4 max-w-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-md'
                      : 'bg-slate-800 text-slate-200 rounded-tl-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>

                {msg.role === 'user' && (
                  <Avatar className="w-8 h-8 bg-slate-600">
                    <AvatarFallback>
                      <User className="h-4 w-4 text-slate-300" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {isStreaming && (
            <div className="flex items-start space-x-3">
              <Avatar className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600">
                <AvatarFallback>
                  <Bot className="h-4 w-4 text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-slate-800 rounded-2xl rounded-tl-md p-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="mt-6 border-t border-slate-600 pt-6">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Textarea
                placeholder="Describe the changes you want to make to your tattoo design..."
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isStreaming}
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={!message.trim() || isStreaming}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
