import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Palette, Sparkles, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-800 text-slate-50">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Zap className="text-amber-500 h-6 w-6" />
              <span className="text-xl font-bold">
                Tattoo<span className="text-amber-500">Stencil</span>Pro
              </span>
            </div>
            <Button
              onClick={() => window.location.href = '/api/login'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold">
              Transform your ideas into{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                professional art
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              AI-powered tattoo stencil generator that creates stunning, professional-quality 
              tattoo designs from your concepts and reference images.
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={() => window.location.href = '/api/login'}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4"
            >
              Start Creating <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                <Zap className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold">AI-Powered Generation</h3>
              <p className="text-slate-400">
                Advanced AI analyzes your concepts and creates professional tattoo stencils
                with perfect line work and composition.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                <Palette className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold">Multiple Styles</h3>
              <p className="text-slate-400">
                Generate designs in various tattoo styles - traditional, neo-traditional,
                realistic, blackwork, and geometric.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold">Interactive Assistant</h3>
              <p className="text-slate-400">
                Chat with our AI assistant to refine your designs and get expert
                tattoo advice throughout the creation process.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to create your next tattoo?</h2>
          <p className="text-slate-400 text-lg">
            Join thousands of artists and tattoo enthusiasts using TattooStencilPro
          </p>
          <Button
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4"
          >
            Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </main>
    </div>
  );
}
