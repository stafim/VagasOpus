import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, 
  Briefcase, 
  Building2,
  UserCheck,
  Users, 
  Shield, 
  TrendingUp, 
  FileText,
  Settings,
  HelpCircle,
  LogOut
} from "lucide-react";
import logoImage from "@assets/Screenshot_20250930_142224_Chrome~2_1759253037075.jpg";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
    description: "Visão geral do sistema"
  },
  {
    name: "Vagas",
    href: "/jobs",
    icon: Briefcase,
    description: "Gerenciar vagas de emprego",
    badge: "Novo"
  },
  {
    name: "Kanban",
    href: "/kanban",
    icon: BarChart3,
    description: "Pipeline de candidatos"
  },
  {
    name: "Empresas",
    href: "/companies",
    icon: Building2,
    description: "Cadastro de empresas"
  },
  {
    name: "Clientes",
    href: "/clients",
    icon: UserCheck,
    description: "Cadastro de clientes"
  },
  {
    name: "Usuários",
    href: "/users",
    icon: Users,
    description: "Gerenciar usuários"
  },
  {
    name: "Permissões",
    href: "/permissions",
    icon: Shield,
    description: "Controle de acesso"
  },
  {
    name: "Desempenho",
    href: "/performance",
    icon: TrendingUp,
    description: "Métricas e KPIs"
  },
  {
    name: "Relatórios",
    href: "/reports",
    icon: FileText,
    description: "Relatórios detalhados"
  },
];

const bottomNavItems = [
  {
    name: "Configurações",
    href: "/settings",
    icon: Settings,
    description: "Configurações do sistema"
  },
  {
    name: "Ajuda",
    href: "/help",
    icon: HelpCircle,
    description: "Central de ajuda"
  },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <nav className="hidden md:flex md:w-72 md:flex-col">
      <div className="flex flex-col flex-grow bg-card border-r border-border shadow-sm">
        {/* Header */}
        <div className="flex items-center flex-shrink-0 px-6 py-6">
          <div className="flex items-center">
            <img 
              src={logoImage} 
              alt="VagasPro Logo" 
              className="w-12 h-12 object-contain"
            />
            <div className="ml-3">
              <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
            </div>
          </div>
        </div>

        <Separator className="mx-6" />

        {/* Navigation */}
        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = location === item.href || location.startsWith(item.href + "/");
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "group flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  data-testid={`link-${item.name.toLowerCase().replace(" ", "-")}`}
                  title={item.description}
                >
                  <div className="flex items-center">
                    <Icon className={cn(
                      "h-5 w-5 mr-3 transition-colors",
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground"
                    )} />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className={cn(
                        "text-xs",
                        isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}>
                        {item.description}
                      </span>
                    </div>
                  </div>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}

          <Separator className="my-4" />

          {/* Bottom Navigation */}
          <div className="space-y-1">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    data-testid={`link-${item.name.toLowerCase()}`}
                    title={item.description}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Profile */}
        <div className="flex-shrink-0 p-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-chart-2 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-sm font-semibold text-primary-foreground">U</span>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">Demo User</p>
                <p className="text-xs text-muted-foreground">Administrador</p>
              </div>
            </div>
            <a
              href="/api/logout"
              className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-accent transition-colors"
              data-testid="button-logout"
              title="Sair do sistema"
            >
              <LogOut className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
