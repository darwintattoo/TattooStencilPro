import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { History, Download, ExternalLink } from "lucide-react";

interface Generation {
  id: string;
  resultUrl: string;
  prompt: string;
  createdAt: string;
  creditCost: number;
}

export default function RecentGenerations() {
  const { data: generations, isLoading } = useQuery<Generation[]>({
    queryKey: ['/api/generations'],
  });

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="bg-slate-700 border-slate-600">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <History className="text-amber-500 h-5 w-5" />
            <span>Recent Generations</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:text-blue-300"
          >
            View All
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-32 w-full rounded-xl bg-slate-600" />
                <Skeleton className="h-4 w-3/4 bg-slate-600" />
              </div>
            ))}
          </div>
        ) : !generations || generations.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400">No generations yet</p>
            <p className="text-sm text-slate-500 mt-1">
              Your generated tattoo designs will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {generations.slice(0, 8).map((generation) => (
              <div
                key={generation.id}
                className="group relative bg-slate-800 rounded-xl overflow-hidden border border-slate-600 hover:border-slate-500 transition-colors cursor-pointer"
              >
                <img
                  src={generation.resultUrl}
                  alt={`Generated tattoo: ${generation.prompt.slice(0, 50)}...`}
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    // Fallback for broken images
                    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23374151"/><text x="100" y="100" text-anchor="middle" fill="%23616161" font-size="12">Image</text></svg>';
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                
                {/* Action buttons */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                  <Button
                    size="sm"
                    className="w-8 h-8 p-0 bg-blue-600 hover:bg-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(generation.resultUrl, `tattoo-${generation.id}.png`);
                    }}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    className="w-8 h-8 p-0 bg-slate-600 hover:bg-slate-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(generation.resultUrl, '_blank');
                    }}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>

                {/* Generation info tooltip */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-white truncate">
                    {generation.prompt.slice(0, 40)}...
                  </p>
                  <p className="text-xs text-slate-300">
                    {new Date(generation.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
