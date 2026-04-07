import { AlertTriangle, AlertCircle, CheckCircle, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface RiskIndicatorProps {
  level: 'low' | 'medium' | 'high';
  score?: number;
  reason?: string;
  details?: string;
  showTooltip?: boolean;
}

const riskConfig = {
  low: {
    label: 'Low Risk',
    color: 'text-accent bg-accent/10',
    icon: CheckCircle,
  },
  medium: {
    label: 'Medium Risk',
    color: 'text-yellow-600 bg-yellow-500/10',
    icon: AlertCircle,
  },
  high: {
    label: 'High Risk',
    color: 'text-destructive bg-destructive/10',
    icon: AlertTriangle,
  },
};

export const RiskIndicator = ({
  level,
  score,
  reason,
  details,
  showTooltip = true,
}: RiskIndicatorProps) => {
  const config = riskConfig[level];
  const Icon = config.icon;

  const content = (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.color} status-badge`}>
      <Icon className="h-4 w-4" />
      <span>{score !== undefined ? `${config.label} (${score})` : config.label}</span>
    </div>
  );

  if (!showTooltip || !reason) {
    return content;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <div className="space-y-1">
          {reason && <p className="font-medium">{reason}</p>}
          {details && <p className="text-xs text-muted-foreground">{details}</p>}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
