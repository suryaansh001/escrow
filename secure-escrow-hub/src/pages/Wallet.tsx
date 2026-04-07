import { motion } from "framer-motion";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAdaptiveEscrow } from "@/context/AdaptiveEscrowContext";

const history = [
  { type: "credit", label: "Escrow Release - TXN-003", amount: "+₹8,500", date: "Jan 18, 2026" },
  { type: "debit", label: "Escrow Funded - TXN-001", amount: "-₹15,000", date: "Jan 15, 2026" },
  { type: "credit", label: "Wallet Top-up", amount: "+₹20,000", date: "Jan 14, 2026" },
  { type: "debit", label: "Escrow Fee", amount: "-₹375", date: "Jan 14, 2026" },
  { type: "credit", label: "Refund - TXN-098", amount: "+₹11,375", date: "Jan 10, 2026" },
];

const WalletPage = () => {
  const { wallet, transactions } = useAdaptiveEscrow();

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-display text-foreground">Wallet</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your funds</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-fintech gradient-hero !text-primary-foreground mb-8"
        >
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <WalletIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Available Balance</span>
          </div>
          <div className="text-4xl font-bold font-display mb-6">₹{wallet.availableBalance.toLocaleString()}</div>
          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            <div className="rounded-xl bg-primary-foreground/10 p-3">
              <p className="text-xs opacity-80">Locked Funds</p>
              <p className="text-lg font-semibold">₹{wallet.lockedFunds.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-primary-foreground/10 p-3">
              <p className="text-xs opacity-80">Pending Transactions</p>
              <p className="text-lg font-semibold">{wallet.pendingTransactions}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button size="sm" className="rounded-xl bg-primary-foreground/20 hover:bg-primary-foreground/30 backdrop-blur border-0">
              <Plus className="mr-1 h-4 w-4" /> Add Funds
            </Button>
            <Button size="sm" variant="outline" className="rounded-xl border-primary-foreground/30 bg-transparent hover:bg-primary-foreground/10">
              <ArrowRight className="mr-1 h-4 w-4" /> Withdraw
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-fintech !p-0 overflow-hidden"
        >
          <div className="p-6 pb-0">
            <h3 className="text-base font-semibold font-display text-foreground mb-4">Transaction History</h3>
          </div>
          <div className="divide-y divide-border">
            {[...history, ...transactions.map((tx) => ({
              type: tx.status === "Released" ? "credit" : "debit",
              label: `${tx.status} - ${tx.id}`,
              amount: `${tx.status === "Released" ? "+" : "-"}₹${tx.amount.toLocaleString()}`,
              date: new Date(tx.createdAt).toLocaleDateString(),
            }))].slice(0, 8).map((item, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    item.type === "credit" ? "bg-accent/10" : "bg-destructive/10"
                  }`}>
                    {item.type === "credit"
                      ? <ArrowDownLeft className="h-4 w-4 text-accent" />
                      : <ArrowUpRight className="h-4 w-4 text-destructive" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${item.type === "credit" ? "text-accent" : "text-destructive"}`}>
                  {item.amount}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default WalletPage;
