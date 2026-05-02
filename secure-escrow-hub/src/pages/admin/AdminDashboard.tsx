import { motion } from "framer-motion";
import {
  AlertTriangle,
  Users,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AdminLayout from "@/components/layout/AdminLayout";
import { ScoreCard } from "@/components/common/ScoreCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Pie, PieChart, Cell, LineChart, Line, CartesianGrid, XAxis } from "recharts";
import { useAdaptiveEscrow } from "@/context/AdaptiveEscrowContext";

const chartConfig = {
  low: { label: "Low", color: "hsl(var(--accent))" },
  medium: { label: "Medium", color: "hsl(var(--warning))" },
  high: { label: "High", color: "hsl(var(--destructive))" },
} satisfies ChartConfig;

const AdminDashboard = () => {
  const { transactions, users, disputes } = useAdaptiveEscrow();

  const flaggedTransactions = transactions.filter((tx) => tx.riskLevel !== "low");
  const highRiskUsers = users.filter((user) => user.trustScore < 60 || user.restricted).length;
  const riskDistribution = [
    { name: "low", value: transactions.filter((tx) => tx.riskLevel === "low").length, color: "hsl(var(--accent))" },
    { name: "medium", value: transactions.filter((tx) => tx.riskLevel === "medium").length, color: "hsl(var(--warning))" },
    { name: "high", value: transactions.filter((tx) => tx.riskLevel === "high").length, color: "hsl(var(--destructive))" },
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-display text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">System overview and key metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <ScoreCard
              label="Total Transactions"
              value={transactions.length}
              icon={<Activity className="h-5 w-5" />}
              trend={{ direction: 'up', value: '+12% this week' }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ScoreCard
              label="Flagged Transactions"
              value={flaggedTransactions.length}
              icon={<AlertTriangle className="h-5 w-5" />}
              status="critical"
              trend={{ direction: 'up', value: '+2 today' }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ScoreCard
              label="High-Risk Users"
              value={highRiskUsers}
              icon={<Users className="h-5 w-5" />}
              status="warning"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ScoreCard
              label="Active Disputes"
              value={disputes.length}
              icon={<TrendingUp className="h-5 w-5" />}
              status="warning"
            />
          </motion.div>
        </div>

        {/* Alert Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Alert className="bg-destructive/10 border-destructive/20">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              {flaggedTransactions.length} transactions require immediate review. {disputes.length}{' '}
              disputes are awaiting resolution.
            </AlertDescription>
          </Alert>
        </motion.div>

        <div className="grid xl:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-fintech">
            <h3 className="text-base font-semibold text-foreground mb-4">Risk Distribution</h3>
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Pie data={riskDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={88}>
                  {riskDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-fintech">
            <h3 className="text-base font-semibold text-foreground mb-4">Fraud Trend</h3>
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <LineChart
                data={[
                  { day: "Mon", flagged: 3 },
                  { day: "Tue", flagged: 4 },
                  { day: "Wed", flagged: 5 },
                  { day: "Thu", flagged: 3 },
                  { day: "Fri", flagged: 6 },
                  { day: "Sat", flagged: 4 },
                  { day: "Sun", flagged: flaggedTransactions.length },
                ]}
              >
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line dataKey="flagged" type="monotone" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </motion.div>
        </div>

        {/* Flagged Transactions Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-fintech"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Recent Flagged Transactions</h3>
            <a href="/admin/flagged" className="text-primary hover:text-primary/80 text-sm font-medium">
              View All →
            </a>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Buyer / Seller</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Flag Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flaggedTransactions.slice(0, 5).map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-mono text-sm font-semibold">{txn.id}</TableCell>
                    <TableCell className="text-sm">
                      <div>
                        <p className="font-medium">Arjun Mehta</p>
                        <p className="text-xs text-muted-foreground">→ {txn.counterpartyName}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">₹{txn.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className="font-mono font-bold text-destructive">{(txn.riskScore/100).toFixed(4)}/1</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{txn.risk.explanation}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card-fintech mt-8 grid sm:grid-cols-2 gap-4"
        >
          <div>
            <h4 className="font-semibold text-foreground mb-3">Risk Detection</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Rolling Window Model</span>
                <span className="text-accent font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">CUSUM Detection</span>
                <span className="text-accent font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Surge Detection</span>
                <span className="text-accent font-medium">Active</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3">Last 24 Hours</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">New Users</span>
                <span className="font-medium text-foreground">143</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Transactions Created</span>
                <span className="font-medium text-foreground">287</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Alerts Triggered</span>
                <span className="font-medium text-destructive">12</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
