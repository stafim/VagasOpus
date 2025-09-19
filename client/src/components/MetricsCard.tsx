import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  subtitle?: string;
  description?: string;
}

export default function MetricsCard({
  title,
  value,
  icon: Icon,
  iconBgColor = "bg-primary/10",
  iconColor = "text-primary",
  trend,
  subtitle = "vs. mês anterior",
  description,
}: MetricsCardProps) {
  return (
    <div className="group bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-lg transition-all duration-200 hover:border-primary/20" data-testid={`card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors group-hover:scale-110 duration-200",
            iconBgColor
          )}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-1" data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}-value`}>
              {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={cn(
              "flex items-center px-2 py-1 rounded-full text-xs font-medium",
              trend.isPositive 
                ? "bg-success/10 text-success" 
                : "bg-destructive/10 text-destructive"
            )}
            data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}-trend`}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {trend.value}
            </div>
          </div>
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        </div>
      )}
    </div>
  );
}
