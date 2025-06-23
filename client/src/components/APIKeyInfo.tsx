import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Key, AlertTriangle } from "lucide-react";

export default function APIKeyInfo() {
  return (
    <Card className="bg-slate-700 border-slate-600">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-amber-500">
          <Key className="h-5 w-5" />
          <span>Configuration Required</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-red-900/20 border-red-500">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-200">
            The AI chat requires an OpenAI API key to function properly.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3 text-sm">
          <h4 className="font-semibold text-white">How to get your OpenAI API key:</h4>
          <ol className="list-decimal list-inside space-y-2 text-slate-300">
            <li>
              Visit{" "}
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 inline-flex items-center"
              >
                OpenAI API Keys
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </li>
            <li>Sign in to your OpenAI account (create one if needed)</li>
            <li>Click "Create new secret key"</li>
            <li>Copy the key (starts with "sk-")</li>
            <li>Add it to your environment secrets</li>
          </ol>
          
          <div className="mt-4 p-3 bg-slate-800 rounded-lg">
            <p className="text-xs text-slate-400">
              <strong>Note:</strong> Your current key appears to be a Replicate token (starts with "r8_"). 
              OpenAI keys start with "sk-" and are different from Replicate tokens.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}