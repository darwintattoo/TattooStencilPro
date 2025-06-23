import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Zap, Lightbulb, Globe, User, Coins } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Zap className="text-amber-500 h-6 w-6" />
              <span className="text-xl font-bold text-slate-50">
                Tattoo<span className="text-amber-500">Stencil</span>Pro
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-slate-300">
              <Coins className="text-amber-500 h-4 w-4" />
              <span>{user?.credits || 0}</span>
              <span>credits</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-slate-50"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Tips
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-slate-50"
            >
              <Globe className="h-4 w-4 mr-2" />
              EN
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl || undefined} />
                    <AvatarFallback className="bg-slate-700">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-slate-700 border-slate-600" align="end">
                <DropdownMenuItem className="hover:bg-slate-600">
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-slate-600">
                  Purchase Credits
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-slate-600"
                  onClick={() => window.location.href = '/api/logout'}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
