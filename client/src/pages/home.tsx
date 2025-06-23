import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Image, Sparkles, ArrowRight, TrendingUp } from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-4xl font-bold">
            Welcome to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              TattooStencilPro
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Create stunning, professional tattoo stencils with the power of AI. 
            Transform your ideas into beautiful tattoo designs.
          </p>
          
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={() => setLocation('/editor')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4"
            >
              Start Creating <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Available</CardTitle>
              <Zap className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">250</div>
              <p className="text-xs text-slate-400">Ready to use</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-700 border-slate-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Images Generated</CardTitle>
              <Image className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-slate-400">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-700 border-slate-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">96%</div>
              <p className="text-xs text-slate-400">Quality designs</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-slate-700 border-slate-600 hover:border-slate-500 transition-colors cursor-pointer"
                onClick={() => setLocation('/editor')}>
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold">Create New Design</h3>
              <p className="text-slate-400">
                Start with an image or describe your vision to our AI assistant
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                <Image className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-semibold">Browse Gallery</h3>
              <p className="text-slate-400">
                View your previous creations and download high-quality files
              </p>
              <Button variant="outline" className="border-slate-500 hover:bg-slate-600">
                View Gallery <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <Card className="bg-slate-700 border-slate-600 mt-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-amber-500" />
              <span>Pro Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800 rounded-lg">
                <h4 className="font-semibold mb-2">Upload Reference Images</h4>
                <p className="text-sm text-slate-400">
                  Start with a clear reference image for better AI analysis and results
                </p>
              </div>
              <div className="p-4 bg-slate-800 rounded-lg">
                <h4 className="font-semibold mb-2">Be Specific in Chat</h4>
                <p className="text-sm text-slate-400">
                  Describe style, size, placement, and specific elements you want
                </p>
              </div>
              <div className="p-4 bg-slate-800 rounded-lg">
                <h4 className="font-semibold mb-2">Try Different Styles</h4>
                <p className="text-sm text-slate-400">
                  Experiment with traditional, neo-traditional, realistic, and geometric styles
                </p>
              </div>
              <div className="p-4 bg-slate-800 rounded-lg">
                <h4 className="font-semibold mb-2">Iterate and Refine</h4>
                <p className="text-sm text-slate-400">
                  Use the chat to make adjustments and perfect your design
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
