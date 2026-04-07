import AdminLayout from "@/components/layout/AdminLayout";
import { useAdaptiveEscrow } from "@/context/AdaptiveEscrowContext";
import { RiskExplanation } from "@/components/common/RiskExplanation";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from "recharts";

const chartConfig = {
  rolling: { label: "Rolling", color: "hsl(var(--primary))" },
  cusum: { label: "CUSUM", color: "hsl(var(--destructive))" },
  surge: { label: "Surge", color: "hsl(var(--warning))" },
} satisfies ChartConfig;

const RiskAnalysis = () => {
  const { transactions } = useAdaptiveEscrow();

  const riskSeries = transactions.map((tx) => ({
    transaction: tx.id,
    rolling: tx.risk.rollingWindowScore,
    cusum: tx.risk.cusumScore,
    surge: Math.round(tx.risk.surgeRatio * 20),
  }));

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Risk Analysis</h1>
          <p className="text-muted-foreground text-sm mt-1">Rolling window, CUSUM, and surge diagnostics with clear reasons.</p>
        </div>

        <div className="grid xl:grid-cols-2 gap-6">
          <div className="card-fintech">
            <h3 className="text-base font-semibold text-foreground mb-4">Anomaly Signals By Transaction</h3>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <BarChart data={riskSeries}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="transaction" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="rolling" fill="var(--color-rolling)" radius={6} />
                <Bar dataKey="cusum" fill="var(--color-cusum)" radius={6} />
                <Bar dataKey="surge" fill="var(--color-surge)" radius={6} />
              </BarChart>
            </ChartContainer>
          </div>

          <div className="card-fintech">
            <h3 className="text-base font-semibold text-foreground mb-4">Fraud Trend (Last 7 Days)</h3>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <LineChart
                data={[
                  { day: "Mon", riskAlerts: 2, disputes: 1 },
                  { day: "Tue", riskAlerts: 3, disputes: 1 },
                  { day: "Wed", riskAlerts: 5, disputes: 2 },
                  { day: "Thu", riskAlerts: 4, disputes: 1 },
                  { day: "Fri", riskAlerts: 6, disputes: 3 },
                  { day: "Sat", riskAlerts: 3, disputes: 2 },
                  { day: "Sun", riskAlerts: 4, disputes: 2 },
                ]}
              >
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line dataKey="riskAlerts" type="monotone" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
                <Line dataKey="disputes" type="monotone" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </div>
        </div>

        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="card-fintech">
              <p className="text-sm font-semibold text-foreground mb-3">{tx.id} • {tx.counterpartyName}</p>
              <RiskExplanation
                rolling={{ score: tx.risk.rollingWindowScore, explanation: "Rolling window anomaly score" }}
                cusum={{ score: tx.risk.cusumScore, explanation: "Cumulative drift from baseline behavior" }}
                surge={{ ratio: tx.risk.surgeRatio, explanation: "Current transaction velocity ratio" }}
                overall={{ level: tx.riskLevel, reason: tx.risk.explanation }}
              />
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default RiskAnalysis;
