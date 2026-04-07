import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";

interface RiskExplanationProps {
  rolling?: { score: number; explanation: string };
  cusum?: { score: number; explanation: string };
  surge?: { ratio: number; explanation: string };
  overall?: { level: 'low' | 'medium' | 'high'; reason: string };
}

export const RiskExplanation = ({
  rolling,
  cusum,
  surge,
  overall,
}: RiskExplanationProps) => {
  return (
    <div className="space-y-4">
      {overall && (
        <div className="card-fintech border-l-4 border-l-primary">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Overall Risk: {overall.level.toUpperCase()}</p>
              <p className="text-sm text-muted-foreground mt-1">{overall.reason}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        {rolling && (
          <div className="p-4 rounded-xl border border-border bg-card">
            <h4 className="font-medium text-sm text-foreground mb-2">Rolling Window</h4>
            <p className="text-lg font-bold text-primary mb-1">{rolling.score.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{rolling.explanation}</p>
          </div>
        )}

        {cusum && (
          <div className="p-4 rounded-xl border border-border bg-card">
            <h4 className="font-medium text-sm text-foreground mb-2">CUSUM Score</h4>
            <p className="text-lg font-bold text-primary mb-1">{cusum.score.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{cusum.explanation}</p>
          </div>
        )}

        {surge && (
          <div className="p-4 rounded-xl border border-border bg-card">
            <h4 className="font-medium text-sm text-foreground mb-2">Surge Ratio</h4>
            <p className="text-lg font-bold text-primary mb-1">{surge.ratio.toFixed(2)}x</p>
            <p className="text-xs text-muted-foreground">{surge.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
};
