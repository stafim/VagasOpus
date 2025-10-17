import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, Menu, LogOut, Search, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface TopBarProps {
  title?: string;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
  createButtonText?: string;
}

export default function TopBar({
  title = "Dashboard",
  showCreateButton = false,
  onCreateClick,
  createButtonText = "Nova Vaga",
}: TopBarProps) {
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [, setLocation] = useLocation();

  // Check if user is in AUTH_BYPASS mode
  const { data: user } = useQuery<{ id: string; email: string; name?: string }>({
    queryKey: ["/api/auth/user"],
  });

  const isAuthBypass = user?.id === "demo-user-bypass";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiRequest("POST", "/api/auth/logout");
      
      toast({
        title: "Logout realizado com sucesso",
        description: "Até logo!",
      });

      // Invalidate auth query to update UI
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Redirect to login page
      setLocation("/login-demo");
    } catch (error: any) {
      toast({
        title: "Erro no logout",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border/40 px-4 py-3 sm:px-6 lg:px-8 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2 h-auto"
            data-testid="button-mobile-menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">{title}</h2>
              {isAuthBypass ? (
                <Badge 
                  variant="outline" 
                  className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 flex items-center gap-1"
                  data-testid="badge-auth-mode"
                >
                  <Shield className="h-3 w-3" />
                  Modo Desenvolvimento
                </Badge>
              ) : (
                <Badge 
                  variant="outline" 
                  className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 flex items-center gap-1"
                  data-testid="badge-auth-mode"
                >
                  <Shield className="h-3 w-3" />
                  Modo Produção
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Center section - Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar em todo o sistema..."
              className="pl-10 bg-background/50 border-border/50 focus:bg-background transition-colors"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-3">
          {/* Search button for mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2 h-auto"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative p-2 h-auto"
            data-testid="button-notifications"
          >
            <Bell className="h-5 w-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>

          {/* Create button */}
          {showCreateButton && onCreateClick && (
            <Button 
              onClick={onCreateClick} 
              data-testid="button-create-job"
              className="shadow-lg hover:shadow-xl transition-shadow"
            >
              <Plus className="h-4 w-4 mr-2" />
              {createButtonText}
            </Button>
          )}

          {/* Logout button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
            data-testid="button-logout"
            className="transition-all hover:scale-105"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isLoggingOut ? "Saindo..." : "Sair"}
          </Button>
        </div>
      </div>
    </header>
  );
}
