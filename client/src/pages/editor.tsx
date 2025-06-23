import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import ImageUpload from "@/components/ImageUpload";
import AIChat from "@/components/AIChat";
import AdvancedSettings from "@/components/AdvancedSettings";
import GenerateButton from "@/components/GenerateButton";
import RecentGenerations from "@/components/RecentGenerations";
import { GenerationSettings } from "@/components/AdvancedSettings";

export default function Editor() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null);
  const [chatPrompt, setChatPrompt] = useState<string>("");
  const [settings, setSettings] = useState<GenerationSettings>({
    style: "traditional",
    lineWeight: "medium",
    guidanceScale: 7.5,
    steps: 30,
    aspectRatio: "4:3"
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const handleImageUploaded = (imageData: any) => {
    setUploadedImageId(imageData.id);
  };

  const handleChatPromptChange = (prompt: string) => {
    setChatPrompt(prompt);
  };

  const handleGenerated = (result: any) => {
    // Handle successful generation
    console.log("Generated:", result);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-800 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-800 text-slate-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Project Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-50">Generate Image</h1>
          <p className="text-slate-400">Powered by FLUX Kontext PRO AI</p>
        </div>

        {/* Image Upload Section - Always at top */}
        <ImageUpload onImageUploaded={handleImageUploaded} />

        {/* AI Assistant Chat - Always visible directly below image upload */}
        <AIChat 
          imageId={uploadedImageId} 
          onPromptChange={handleChatPromptChange}
        />

        {/* Advanced Settings */}
        <AdvancedSettings 
          settings={settings}
          onSettingsChange={setSettings}
        />

        {/* Generate Button */}
        <GenerateButton 
          prompt={chatPrompt}
          imageId={uploadedImageId || undefined}
          settings={settings}
          onGenerated={handleGenerated}
        />

        {/* Recent Generations */}
        <RecentGenerations />
      </main>
    </div>
  );
}
