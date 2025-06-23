import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sparkles, Coins, Loader2 } from "lucide-react";
import { GenerationSettings } from "./AdvancedSettings";
import CreditsPurchaseModal from "./CreditsPurchaseModal";

interface GenerateButtonProps {
  prompt?: string;
  imageId?: string;
  settings: GenerationSettings;
  onGenerated?: (result: any) => void;
}

export default function GenerateButton({ 
  prompt, 
  imageId, 
  settings, 
  onGenerated 
}: GenerateButtonProps) {
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!prompt?.trim()) {
        throw new Error("Please provide a prompt or chat with the AI assistant first");
      }

      return await apiRequest('POST', '/api/generate', {
        prompt: prompt.trim(),
        imageId,
        settings
      }).then(res => res.json());
    },
    onSuccess: (data) => {
      toast({
        title: "Image generated successfully!",
        description: `${data.creditsUsed} credits used. ${data.creditsRemaining} credits remaining.`,
      });
      onGenerated?.(data);
    },
    onError: (error: any) => {
      if (error.message.includes('Insufficient credits')) {
        setShowCreditsModal(true);
      } else {
        toast({
          title: "Generation failed",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  const handleGenerate = () => {
    if (!user || user.credits < 5) {
      setShowCreditsModal(true);
      return;
    }

    generateMutation.mutate();
  };

  const creditCost = 5;
  const hasEnoughCredits = user && user.credits >= creditCost;

  return (
    <>
      <div className="flex flex-col items-center space-y-4">
        <Button
          onClick={handleGenerate}
          disabled={generateMutation.isPending || !prompt?.trim()}
          className="w-full max-w-md px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-2xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-3 h-5 w-5" />
              Generate Image
            </>
          )}
        </Button>
        
        <p className="text-sm text-slate-400 text-center flex items-center">
          <Coins className="text-amber-500 mr-1 h-4 w-4" />
          This will use {creditCost} credits
          {!hasEnoughCredits && (
            <span className="ml-2 text-red-400">
              (Insufficient credits - {user?.credits || 0} available)
            </span>
          )}
        </p>

        {!prompt?.trim() && (
          <p className="text-xs text-slate-500 text-center max-w-md">
            Start chatting with the AI assistant or provide a prompt to generate your tattoo design
          </p>
        )}
      </div>

      <CreditsPurchaseModal
        isOpen={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
      />
    </>
  );
}
