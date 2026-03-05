import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Shield,
  Wallet,
  Activity,
  Eye,
  AlertCircle,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { dashboardApi } from "@/lib/api";

const statusColors: Record<string, string> = {
  Funded: "bg-primary/10 text-primary",
  Pending: "bg-warning/10 text-warning",
  Released: "bg-accent/10 text-accent",
  Dispute: "bg-destructive/10 text-destructive",
};

const riskColors: Record<string, string> = {
  Low: "risk-badge-low",
  Medium: "risk-badge-medium",
  High: "risk-badge-high",
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await dashboardApi.getDashboardData();
        if (response.success && response.data) {
          setDashboardData(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto flex items-center justify-center h-96">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          <Alert className="bg-destructive/10 border-destructive/20">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">{error}</AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  if (!dashboardData) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          <Alert className="bg-warning/10 border-warning/20">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertDescription className="text-warning">No dashboard data available</AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  const {
    metrics,
    riskProfile,
    recentTransactions,
  } = dashboardData;

  const overviewCards = [
    { label: "Total Transactions", value: metrics.totalTransactions.toString(), change: "+12%", up: true, icon: TrendingUp },
    { label: "Active Escrows", value: metrics.activeEscrows.toString(), change: "+3", up: true, icon: Activity },
    { label: "Wallet Balance", value: `₹${metrics.walletBalance.toLocaleString()}`, change: "+₹5,200", up: true, icon: Wallet },
    { label: "Risk Score", value: riskProfile.level, change: `${riskProfile.score}/100`, up: false, icon: Shield, isRisk: true },
  ];
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-display text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Overview of your escrow activity</p>
        </div>

        {/* Overview Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {overviewCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="card-fintech"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold font-display text-foreground">{card.value}</div>
              <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${card.isRisk ? "text-accent" : card.up ? "text-accent" : "text-destructive"}`}>
                {card.up ? <ArrowUpRight className="h-3 w-3" /> : card.isRisk ? <Shield className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {card.change}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Risk Score Gauge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card-fintech mb-8"
        >
          <h3 className="text-base font-semibold font-display text-foreground mb-4">Risk Profile</h3>
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--accent))" strokeWidth="6"
                  strokeDasharray={`${(riskProfile.score / 100) * 213.6} 213.6`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold font-display text-foreground">{riskProfile.score}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-accent">{riskProfile.level} Risk</p>
              <p className="text-xs text-muted-foreground mt-1">{riskProfile.description}</p>
            </div>
          </div>
        </motion.div>

        {/* Transactions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card-fintech overflow-hidden !p-0"
        >
          <div className="p-6 pb-0">
            <h3 className="text-base font-semibold font-display text-foreground mb-4">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Counterparty</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Risk</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentTransactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-foreground">{tx.id}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{tx.counterparty}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">₹{tx.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`status-badge ${statusColors[tx.state] || 'bg-muted text-muted-foreground'}`}>{tx.state}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`status-badge ${riskColors[tx.risk]}`}>{tx.risk}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/transaction/${tx.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
