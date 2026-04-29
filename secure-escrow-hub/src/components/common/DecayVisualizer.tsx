import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { TrendingDown, Clock, Info } from "lucide-react";
import { dashboardApi } from "@/lib/api";

interface DecayData {
  currentScore: number;
  currentScorePercent: number;
  lambda: number;
  halfLifeDays: number;
  projections: { day30: number; day60: number; day90: number };
  dataPoints: { day: number; score: number; scorePercent: number }[];
}

// Zone thresholds (on 0–100 scale)
const ZONE_FREEZE = 25;   // < 25 → immediate_freeze risk
const ZONE_RESTRICT = 45; // 25–45 → partial_restriction
const ZONE_MONITOR = 55;  // 45–55 → monitoring

function getZoneColor(score: number): string {
  if (score >= 55) return "hsl(160 84% 39%)";        // accent green
  if (score >= 45) return "hsl(38 92% 50%)";          // warning amber
  if (score >= 25) return "hsl(25 95% 53%)";          // orange
  return "hsl(0 72% 51%)";                            // destructive red
}

function getZoneLabel(score: number): string {
  if (score >= 55) return "Normal";
  if (score >= 45) return "Monitoring";
  if (score >= 25) return "Restricted";
  return "Freeze Risk";
}

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;
  const val: number = payload[0]?.value ?? 0;
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-lg text-sm">
      <p className="font-medium text-foreground mb-1">Day {label}</p>
      <p className="text-muted-foreground">
        Score:{" "}
        <span className="font-semibold" style={{ color: getZoneColor(val) }}>
          {val.toFixed(1)}%
        </span>
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">
        Zone:{" "}
        <span style={{ color: getZoneColor(val) }}>{getZoneLabel(val)}</span>
      </p>
    </div>
  );
};

export function DecayVisualizer() {
  const [data, setData] = useState<DecayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardApi
      .getDecayPreview()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card-fintech animate-pulse">
        <div className="h-4 w-40 bg-muted rounded mb-4" />
        <div className="h-48 bg-muted rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card-fintech border-destructive/30">
        <p className="text-sm text-destructive">Failed to load decay visualizer</p>
      </div>
    );
  }

  // Thin the data points to every 3rd day for a cleaner chart (31 points over 90 days)
  const chartData = data.dataPoints.filter((_, i) => i % 3 === 0);

  const currentColor = getZoneColor(data.currentScorePercent);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="card-fintech !p-0 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-base font-semibold font-display text-foreground">
                Inactivity Decay Projection
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              How your reliability score erodes if you make no transactions
              &nbsp;(λ&nbsp;=&nbsp;{data.lambda})
            </p>
          </div>
          {/* Current score badge */}
          <div
            className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold border"
            style={{
              color: currentColor,
              borderColor: currentColor + "40",
              background: currentColor + "15",
            }}
          >
            {data.currentScorePercent.toFixed(1)}% now
          </div>
        </div>

        {/* 30 / 60 / 90 day summary pills */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "30 days", val: data.projections.day30 },
            { label: "60 days", val: data.projections.day60 },
            { label: "90 days", val: data.projections.day90 },
          ].map(({ label, val }) => {
            const col = getZoneColor(val);
            return (
              <div
                key={label}
                className="rounded-xl px-3 py-2 text-center border"
                style={{ borderColor: col + "40", background: col + "12" }}
              >
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: col }}>
                  {val.toFixed(1)}%
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 pb-4" style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 16, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="decayGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(224 76% 55%)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(224 76% 55%)" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(220 13% 91%)"
              strokeOpacity={0.5}
              vertical={false}
            />

            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: "hsl(220 9% 46%)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `d${v}`}
              interval={4}
            />

            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "hsl(220 9% 46%)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(224 76% 55%)", strokeWidth: 1.5, strokeDasharray: "4 2" }} />

            {/* Risk zone reference lines */}
            <ReferenceLine
              y={ZONE_FREEZE}
              stroke="hsl(0 72% 51%)"
              strokeDasharray="4 3"
              strokeOpacity={0.6}
              label={{ value: "Freeze", position: "insideTopRight", fontSize: 9, fill: "hsl(0 72% 51%)" }}
            />
            <ReferenceLine
              y={ZONE_RESTRICT}
              stroke="hsl(25 95% 53%)"
              strokeDasharray="4 3"
              strokeOpacity={0.6}
              label={{ value: "Restrict", position: "insideTopRight", fontSize: 9, fill: "hsl(25 95% 53%)" }}
            />
            <ReferenceLine
              y={ZONE_MONITOR}
              stroke="hsl(38 92% 50%)"
              strokeDasharray="4 3"
              strokeOpacity={0.6}
              label={{ value: "Monitor", position: "insideTopRight", fontSize: 9, fill: "hsl(38 92% 50%)" }}
            />

            <Area
              type="monotone"
              dataKey="scorePercent"
              stroke="hsl(224 76% 55%)"
              strokeWidth={2.5}
              fill="url(#decayGradient)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "hsl(224 76% 55%)", fill: "hsl(0 0% 100%)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Half-life footer */}
      <div className="border-t border-border px-6 py-3 flex items-center gap-2">
        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground">
          Score halves every{" "}
          <span className="font-semibold text-foreground">{data.halfLifeDays} days</span>{" "}
          of inactivity.{" "}
          <span className="text-primary font-medium">Make a transaction to reset the clock.</span>
        </p>
        <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-auto" />
      </div>
    </motion.div>
  );
}
