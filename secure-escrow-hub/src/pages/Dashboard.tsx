import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Bell, Shield, Wallet, Activity, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { RiskIndicator } from "@/components/common/RiskIndicator";
import { useAdaptiveEscrow } from "@/context/AdaptiveEscrowContext";

const statusColors: Record<string, string> = {
  Initiated: "bg-primary/10 text-primary",
  Locked: "bg-warning/10 text-warning",
  "In Progress": "bg-primary/10 text-primary",
  Released: "bg-accent/10 text-accent",
  Disputed: "bg-destructive/10 text-destructive",
  Frozen: "bg-destructive/10 text-destructive",
};

const Dashboard = () => {
  const {
    reliabilityScore,
    riskLevel,
    kycStatus,
    wallet,
    transactions,
    notifications,
  } = useAdaptiveEscrow();

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Adaptive escrow overview with live risk visibility</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/create-transaction">Create Transaction</Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link to="/wallet">View Wallet</Link>
            </Button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card-fintech">
            <p className="text-sm text-muted-foreground mb-2">Reliability Score</p>
            <p className="text-3xl font-bold font-display text-foreground">{reliabilityScore}</p>
            <p className="text-xs text-muted-foreground mt-1">0-100 dynamic trust index</p>
          </div>

          <div className="card-fintech">
            <p className="text-sm text-muted-foreground mb-2">KYC Status</p>
            <p className="text-lg font-semibold text-foreground">{kycStatus}</p>
            <p className="text-xs text-muted-foreground mt-1">Identity and bank checks</p>
          </div>

          <div className="card-fintech">
            <p className="text-sm text-muted-foreground mb-2">Risk Level</p>
            <RiskIndicator
              level={riskLevel}
              reason="Computed from rolling window, CUSUM and surge detection"
              showTooltip={false}
            />
            <p className="text-xs text-muted-foreground mt-2">Current account posture</p>
          </div>

          <div className="card-fintech">
            <p className="text-sm text-muted-foreground mb-2">Pending Transactions</p>
            <p className="text-3xl font-bold font-display text-foreground">{wallet.pendingTransactions}</p>
            <p className="text-xs text-muted-foreground mt-1">Includes locked and in-progress</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-fintech lg:col-span-2 !p-0 overflow-hidden">
            <div className="p-6 pb-0">
              <h3 className="text-base font-semibold font-display text-foreground mb-4">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Counterparty</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Risk</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.slice(0, 5).map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-foreground">{tx.id}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{tx.counterpartyName}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">₹{tx.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`status-badge ${statusColors[tx.status]}`}>{tx.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <RiskIndicator level={tx.riskLevel} score={tx.riskScore} reason={tx.risk.explanation} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button asChild size="sm" variant="ghost" className="rounded-xl">
                          <Link to={`/transaction/${tx.id}`}>
                            Details <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <div className="space-y-6">
            <div className="card-fintech">
              <h3 className="text-base font-semibold font-display text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button asChild className="w-full rounded-xl justify-start">
                  <Link to="/create-transaction">
                    <Activity className="mr-2 h-4 w-4" /> Create Transaction
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full rounded-xl justify-start">
                  <Link to="/wallet">
                    <Wallet className="mr-2 h-4 w-4" /> View Wallet
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full rounded-xl justify-start">
                  <Link to="/counterparty/usr-2">
                    <UserCircle2 className="mr-2 h-4 w-4" /> Counterparty Profile
                  </Link>
                </Button>
              </div>
            </div>

            <div className="card-fintech">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold font-display text-foreground">Recent Alerts</h3>
                <Button asChild variant="ghost" size="sm" className="rounded-xl">
                  <Link to="/notifications">All</Link>
                </Button>
              </div>
              <div className="space-y-3">
                {notifications.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-muted/60">
                    <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <Bell className="h-3.5 w-3.5 text-primary" /> {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-fintech">
              <p className="text-sm font-medium text-foreground mb-2">Locked Funds</p>
              <p className="text-2xl font-bold font-display text-foreground">₹{wallet.lockedFunds.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Held in active escrow lifecycles</p>
              <div className="mt-3">
                <RiskIndicator
                  level={wallet.lockedFunds > 100000 ? "high" : wallet.lockedFunds > 50000 ? "medium" : "low"}
                  reason="Exposure based on currently locked capital"
                  showTooltip={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
