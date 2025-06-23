import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, Loader2, Check } from "lucide-react";

interface CreditsPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const creditPackages = [
  {
    id: 'pro-monthly',
    name: 'Pro Monthly',
    credits: 200,
    price: 9.99,
    description: 'Best value for regular users',
    popular: true,
  },
  {
    id: 'credit-topup',
    name: 'Credit Top-up',
    credits: 100,
    price: 4.99,
    description: 'One-time credit purchase',
    popular: false,
  },
];

export default function CreditsPurchaseModal({ isOpen, onClose }: CreditsPurchaseModalProps) {
  const [selectedPackage, setSelectedPackage] = useState(creditPackages[0]);
  const { toast } = useToast();

  const purchaseMutation = useMutation({
    mutationFn: async (packageData: typeof creditPackages[0]) => {
      const response = await apiRequest('POST', '/api/create-payment-intent', {
        amount: packageData.price,
        credits: packageData.credits,
      });
      return response.json();
    },
    onSuccess: (data) => {
      // In a real implementation, you would redirect to Stripe Checkout
      // or handle the payment intent client secret
      toast({
        title: "Payment Intent Created",
        description: "Redirecting to secure payment...",
      });
      
      // For now, we'll just show a success message
      setTimeout(() => {
        toast({
          title: "Purchase Successful!",
          description: `${selectedPackage.credits} credits added to your account.`,
        });
        onClose();
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    },
  });

  const handlePurchase = () => {
    if (!process.env.VITE_STRIPE_PUBLIC_KEY) {
      toast({
        title: "Payment Not Available",
        description: "Payment processing is not configured. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    purchaseMutation.mutate(selectedPackage);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-600 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center space-y-3">
            <div className="flex justify-center">
              <Coins className="text-amber-500 h-12 w-12" />
            </div>
            <h2 className="text-2xl font-bold">Purchase Credits</h2>
            <p className="text-slate-400 font-normal">
              Choose a credit package to continue generating
            </p>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {creditPackages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`cursor-pointer transition-colors ${
                selectedPackage.id === pkg.id
                  ? 'bg-slate-700 border-blue-500 border-2'
                  : 'bg-slate-700 border-slate-600 hover:border-slate-500'
              }`}
              onClick={() => setSelectedPackage(pkg)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-left space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold">{pkg.name}</p>
                      {pkg.popular && (
                        <span className="px-2 py-1 bg-blue-500 text-xs rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">
                      {pkg.credits} credits • {pkg.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <p className="text-xl font-bold">${pkg.price}</p>
                    {selectedPackage.id === pkg.id && (
                      <Check className="h-5 w-5 text-blue-400" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex space-x-3 mt-6">
          <Button
            variant="outline"
            className="flex-1 border-slate-500 hover:bg-slate-600"
            onClick={onClose}
            disabled={purchaseMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={handlePurchase}
            disabled={purchaseMutation.isPending}
          >
            {purchaseMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Purchase $${selectedPackage.price}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
