import { cn } from "@/lib/utils";

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconBgColor?: string;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  subtitle?: string;
}

export default function MetricsCard({
  title,
  value,
  icon,
  iconBgColor = "bg-primary/10",
  iconColor = "text-primary",
  trend,
  subtitle = "vs. mês anterior",
}: MetricsCardProps) {
  return (
    <div className="bg-card p-6 rounded-lg border border-border shadow-sm" data-testid={`card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBgColor)}>
          <i className={cn(icon, "text-lg", iconColor)}></i>
        </div>
        <div className="ml-4">
          <p className="text-2xl font-bold text-foreground" data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}-value`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span
            className={cn(
              "flex items-center",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}
            data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}-trend`}
          >
            <i
              className={cn(
                "mr-1",
                trend.isPositive ? "fas fa-arrow-up" : "fas fa-arrow-down"
              )}
            ></i>
            {trend.value}
          </span>
          <span className="text-muted-foreground ml-2">{subtitle}</span>
        </div>
      )}
    </div>
  );
}
