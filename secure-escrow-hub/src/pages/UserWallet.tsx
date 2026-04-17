import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet, Send, TrendingUp, Lock, Clock, ArrowUpRight, ArrowDownLeft, Loader, Plus, Minus, UserCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ScoreCard } from "@/components/common/ScoreCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { walletApi, dashboardApi } from "@/lib/api";
import { WalletBalance, WalletTransaction } from "@/lib/api";

interface Transaction {
  id: string;
  type: 'received' | 'sent' | 'locked' | 'deposit' | 'withdrawal';
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'locked';
}

const WalletPage = () => {
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [users, setUsers] = useState<{ id: string; email: string; full_name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Transaction dialogs
  const [depositDialog, setDepositDialog] = useState(false);
  const [withdrawDialog, setWithdrawDialog] = useState(false);
  const [transferDialog, setTransferDialog] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferRecipient, setTransferRecipient] = useState("");
  const [transactionLoading, setTransactionLoading] = useState(false);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        // For now, assume user ID is available - in real app this would come from auth context
        const userId = "user-id-placeholder"; // TODO: Get from auth context

        const [balanceRes, transactionsRes, usersRes] = await Promise.all([
          walletApi.getBalance(userId),
          walletApi.getTransactionHistory(userId, 20),
          dashboardApi.listUsers()
        ]);

        if (balanceRes.success) setWalletData(balanceRes.data);
        if (transactionsRes.success) setTransactions(transactionsRes.data);
        if (usersRes.success) setUsers(usersRes.users || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load wallet data");
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setError("Please enter a valid deposit amount");
      return;
    }

    try {
      setTransactionLoading(true);
      setError(null);
      const userId = "user-id-placeholder"; // TODO: Get from auth context

      const result = await walletApi.deposit(userId, parseFloat(depositAmount), "Manual deposit");
      if (result.success) {
        setWalletData(prev => prev ? { ...prev, wallet_balance: result.data.balance } : null);
        setDepositDialog(false);
        setDepositAmount("");
        // Refresh transactions
        const transactionsRes = await walletApi.getTransactionHistory(userId, 20);
        if (transactionsRes.success) setTransactions(transactionsRes.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deposit failed");
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setError("Please enter a valid withdrawal amount");
      return;
    }

    try {
      setTransactionLoading(true);
      setError(null);
      const userId = "user-id-placeholder"; // TODO: Get from auth context

      const result = await walletApi.withdraw(userId, parseFloat(withdrawAmount), "Manual withdrawal");
      if (result.success) {
        setWalletData(prev => prev ? { ...prev, wallet_balance: result.data.balance } : null);
        setWithdrawDialog(false);
        setWithdrawAmount("");
        // Refresh transactions
        const transactionsRes = await walletApi.getTransactionHistory(userId, 20);
        if (transactionsRes.success) setTransactions(transactionsRes.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Withdrawal failed");
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferAmount || !transferRecipient || parseFloat(transferAmount) <= 0) {
      setError("Please enter valid transfer details");
      return;
    }

    try {
      setTransactionLoading(true);
      setError(null);
      const userId = "user-id-placeholder"; // TODO: Get from auth context

      const result = await walletApi.transfer(userId, transferRecipient, parseFloat(transferAmount), "Manual transfer");
      if (result.success) {
        setWalletData(prev => prev ? { ...prev, wallet_balance: result.data.fromBalance } : null);
        setTransferDialog(false);
        setTransferAmount("");
        setTransferRecipient("");
        // Refresh transactions
        const transactionsRes = await walletApi.getTransactionHistory(userId, 20);
        if (transactionsRes.success) setTransactions(transactionsRes.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed");
    } finally {
      setTransactionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const availableBalance = walletData?.wallet_balance || 0;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-display text-foreground">Wallet</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your balance and view transaction history</p>
        </div>

        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Balance Overview */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <ScoreCard
              label="Available Balance"
              value={`₹${availableBalance.toLocaleString()}`}
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
              label="Wallet Balance"
              value={`₹${availableBalance.toLocaleString()}`}
              icon={<Wallet className="h-5 w-5" />}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ScoreCard
              label="Total Transactions"
              value={transactions.length}
              icon={<Clock className="h-5 w-5" />}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ScoreCard
              label="User Name"
              value={walletData?.full_name || "N/A"}
              icon={<UserCircle2 className="h-5 w-5" />}
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
            <Dialog open={depositDialog} onOpenChange={setDepositDialog}>
              <DialogTrigger asChild>
                <Button variant="default" className="rounded-xl gap-2">
                  <Plus className="h-4 w-4" /> Deposit Funds
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Deposit Funds</DialogTitle>
                  <DialogDescription>
                    Add funds to your wallet
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="deposit-amount">Amount (₹)</Label>
                    <Input
                      id="deposit-amount"
                      type="number"
                      placeholder="Enter amount"
                      className="rounded-xl"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full rounded-xl"
                    onClick={handleDeposit}
                    disabled={transactionLoading}
                  >
                    {transactionLoading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : null}
                    Confirm Deposit
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={withdrawDialog} onOpenChange={setWithdrawDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="rounded-xl gap-2">
                  <Minus className="h-4 w-4" /> Withdraw Funds
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
                    <Label htmlFor="withdraw-amount">Amount (₹)</Label>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      placeholder="Enter amount"
                      className="rounded-xl"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Available: ₹{availableBalance.toLocaleString()}
                  </p>
                  <Button
                    className="w-full rounded-xl"
                    onClick={handleWithdraw}
                    disabled={transactionLoading}
                  >
                    {transactionLoading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : null}
                    Confirm Withdrawal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={transferDialog} onOpenChange={setTransferDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="rounded-xl gap-2">
                  <Send className="h-4 w-4" /> Transfer Funds
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Transfer Funds</DialogTitle>
                  <DialogDescription>
                    Send funds to another user
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="transfer-recipient">Recipient</Label>
                    <Select value={transferRecipient} onValueChange={setTransferRecipient}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select recipient" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.filter(u => u.id !== "user-id-placeholder").map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="transfer-amount">Amount (₹)</Label>
                    <Input
                      id="transfer-amount"
                      type="number"
                      placeholder="Enter amount"
                      className="rounded-xl"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Available: ₹{availableBalance.toLocaleString()}
                  </p>
                  <Button
                    className="w-full rounded-xl"
                    onClick={handleTransfer}
                    disabled={transactionLoading}
                  >
                    {transactionLoading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : null}
                    Confirm Transfer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-mono text-sm">{txn.id.slice(-8)}</TableCell>
                    <TableCell>
                      <span className={`status-badge ${
                        txn.transaction_type === 'deposit' ? 'bg-accent/10 text-accent' :
                        txn.transaction_type === 'withdrawal' ? 'bg-destructive/10 text-destructive' :
                        txn.transaction_type === 'transfer_sent' ? 'bg-orange-500/10 text-orange-600' :
                        txn.transaction_type === 'transfer_received' ? 'bg-green-500/10 text-green-600' :
                        'bg-primary/10 text-primary'
                      }`}>
                        {txn.transaction_type.replace('_', ' ').toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {txn.transaction_type === 'transfer_received' && (
                          <ArrowDownLeft className="h-4 w-4 text-accent" />
                        )}
                        {txn.transaction_type === 'transfer_sent' && (
                          <ArrowUpRight className="h-4 w-4 text-destructive" />
                        )}
                        {txn.transaction_type === 'deposit' && (
                          <Plus className="h-4 w-4 text-accent" />
                        )}
                        {txn.transaction_type === 'withdrawal' && (
                          <Minus className="h-4 w-4 text-destructive" />
                        )}
                        {txn.description}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      <span className={
                        txn.transaction_type === 'transfer_sent' || txn.transaction_type === 'withdrawal'
                          ? 'text-destructive'
                          : 'text-accent'
                      }>
                        {txn.transaction_type === 'transfer_sent' || txn.transaction_type === 'withdrawal' ? '-' : '+'}
                        ₹{txn.amount.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(txn.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className={`status-badge ${
                        txn.status === 'completed'
                          ? 'bg-accent/10 text-accent'
                          : 'bg-primary/10 text-primary'
                      }`}>
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
};

export default WalletPage;
