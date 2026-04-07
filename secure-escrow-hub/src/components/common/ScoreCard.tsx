import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface ScoreCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  status?: 'good' | 'warning' | 'critical';
  description?: string;
  trend?: { direction: 'up' | 'down'; value: string };
}

export const ScoreCard = ({
  label,
  value,
  unit,
  icon,
  status = 'good',
  description,
  trend,
}: ScoreCardProps) => {
  const statusColor = {
    good: 'text-accent',
    warning: 'text-yellow-600',
    critical: 'text-destructive',
  };

  const statusBgColor = {
    good: 'bg-accent/5',
    warning: 'bg-yellow-500/5',
    critical: 'bg-destructive/5',
  };

  return (
    <div className={`card-fintech ${statusBgColor[status]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold ${statusColor[status]}`}>{value}</span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
          {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
        </div>
        {icon && <div className="text-muted-foreground opacity-60">{icon}</div>}
      </div>
      {trend && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className={`text-xs font-medium ${trend.direction === 'up' ? 'text-accent' : 'text-destructive'}`}>
            {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
          </p>
        </div>
      )}
    </div>
  );
};
