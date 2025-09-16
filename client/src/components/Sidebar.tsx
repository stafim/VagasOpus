import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "fas fa-chart-line",
  },
  {
    name: "Vagas",
    href: "/jobs",
    icon: "fas fa-briefcase",
  },
  {
    name: "Empresas",
    href: "/companies",
    icon: "fas fa-building",
  },
  {
    name: "Usuários",
    href: "/users",
    icon: "fas fa-users",
  },
  {
    name: "Desempenho",
    href: "/performance",
    icon: "fas fa-chart-bar",
  },
  {
    name: "Relatórios",
    href: "/reports",
    icon: "fas fa-file-alt",
  },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <nav className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-card border-r border-border">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-briefcase text-primary-foreground text-sm"></i>
            </div>
            <h1 className="ml-3 text-xl font-bold text-foreground">VagasPro</h1>
          </div>
        </div>
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navigationItems.map((item) => {
              const isActive = location === item.href || location.startsWith(item.href + "/");
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={cn(
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    data-testid={`link-${item.name.toLowerCase().replace(" ", "-")}`}
                  >
                    <i className={cn(item.icon, "mr-3 text-sm")} />
                    {item.name}
                  </a>
                </Link>
              );
            })}
          </nav>

          <div className="flex-shrink-0 p-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0 flex-1">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-secondary-foreground">U</span>
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">Usuário</p>
                  <p className="text-xs text-muted-foreground">Sistema</p>
                </div>
              </div>
              <a
                href="/api/logout"
                className="text-muted-foreground hover:text-foreground p-1"
                data-testid="button-logout"
                title="Sair"
              >
                <i className="fas fa-sign-out-alt text-sm" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
