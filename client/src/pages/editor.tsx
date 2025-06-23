import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import ImageUpload from "@/components/ImageUpload";
import AIChat from "@/components/AIChat";
import AdvancedSettings from "@/components/AdvancedSettings";
import GenerateButton from "@/components/GenerateButton";
import RecentGenerations from "@/components/RecentGenerations";

export default function Editor() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

        {/* Image Upload Section */}
        <ImageUpload />

        {/* AI Assistant Chat */}
        <AIChat />

        {/* Advanced Settings */}
        <AdvancedSettings />

        {/* Generate Button */}
        <GenerateButton />

        {/* Recent Generations */}
        <RecentGenerations />
      </main>
    </div>
  );
}
