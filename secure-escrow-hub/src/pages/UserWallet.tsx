import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet, Send, TrendingUp, Lock, Clock, ArrowUpRight, ArrowDownLeft, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ScoreCard } from "@/components/common/ScoreCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface WalletData {
  availableBalance: number;
  lockedFunds: number;
  totalBalance: number;
  pendingTransactions: number;
}

interface Transaction {
  id: string;
  type: 'received' | 'sent' | 'locked';
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'locked';
}

const WalletPage = () => {
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState<WalletData>({
    availableBalance: 24500,
    lockedFunds: 15000,
    totalBalance: 39500,
    pendingTransactions: 3,
  });

  const [transactions] = useState<Transaction[]>([
    {
      id: 'TXN-001',
      type: 'received',
      description: 'Payment from Priya Sharma',
      amount: 8000,
      date: '2026-04-05',
      status: 'completed',
    },
    {
      id: 'TXN-002',
      type: 'sent',
      description: 'Payment to Rajesh Kumar',
      amount: 5000,
      date: '2026-04-03',
      status: 'completed',
    },
    {
      id: 'TXN-003',
      type: 'locked',
      description: 'Escrow fund for laptop purchase',
      amount: 15000,
      date: '2026-04-01',
      status: 'locked',
    },
  ]);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-display text-foreground">Wallet</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your balance and view transaction history</p>
        </div>

        {/* Balance Overview */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <ScoreCard
              label="Available Balance"
              value={`₹${walletData.availableBalance.toLocaleString()}`}
              icon={<TrendingUp className="h-5 w-5" />}
              status="good"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ScoreCard
              label="Locked Funds"
              value={`₹${walletData.lockedFunds.toLocaleString()}`}
              icon={<Lock className="h-5 w-5" />}
              status="warning"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ScoreCard
              label="Total Balance"
              value={`₹${walletData.totalBalance.toLocaleString()}`}
              icon={<Wallet className="h-5 w-5" />}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ScoreCard
              label="Pending Transactions"
              value={walletData.pendingTransactions}
              icon={<Clock className="h-5 w-5" />}
              status="warning"
            />
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-fintech mb-8"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="default" className="rounded-xl gap-2">
                  <Send className="h-4 w-4" /> Withdraw Funds
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Withdraw Funds</DialogTitle>
                  <DialogDescription>
                    Transfer funds from your wallet to your bank account
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Amount (₹)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      className="rounded-xl"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Available: ₹{walletData.availableBalance.toLocaleString()}
                  </p>
                  <Button className="w-full rounded-xl">Confirm Withdrawal</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="rounded-xl gap-2">
              <Wallet className="h-4 w-4" /> Add Funds
            </Button>

            <Button variant="outline" className="rounded-xl gap-2">
              View Bank Accounts
            </Button>
          </div>
        </motion.div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-fintech"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Transaction History</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-mono text-sm">{txn.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {txn.type === 'received' && (
                          <ArrowDownLeft className="h-4 w-4 text-accent" />
                        )}
                        {txn.type === 'sent' && (
                          <ArrowUpRight className="h-4 w-4 text-destructive" />
                        )}
                        {txn.type === 'locked' && (
                          <Lock className="h-4 w-4 text-warning" />
                        )}
                        {txn.description}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      <span className={txn.type === 'sent' ? 'text-destructive' : 'text-accent'}>
                        {txn.type === 'sent' ? '-' : '+'}₹{txn.amount.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{txn.date}</TableCell>
                    <TableCell>
                      <span
                        className={`status-badge ${
                          txn.status === 'completed'
                            ? 'bg-accent/10 text-accent'
                            : txn.status === 'locked'
                              ? 'bg-yellow-500/10 text-yellow-600'
                              : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default WalletPage;
