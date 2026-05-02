import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Filter, Lock, Unlock, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AdminLayout from "@/components/layout/AdminLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RiskIndicator } from "@/components/common/RiskIndicator";
import { RiskExplanation } from "@/components/common/RiskExplanation";
import { Badge } from "@/components/ui/badge";
import { useAdaptiveEscrow } from "@/context/AdaptiveEscrowContext";

interface FlaggedTxn {
  id: string;
  buyer: string;
  seller: string;
  amount: number;
  riskScore: number;
  flags: string[];
  status: 'pending' | 'frozen' | 'reviewing';
  rolling: number;
  cusum: number;
  surge: number;
  date: string;
}

const FlaggedTransactions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "frozen" | "reviewing">("all");
  const [selectedTxn, setSelectedTxn] = useState<FlaggedTxn | null>(null);
  const { transactions, freezeTransaction, releaseFunds, markAsFraud } = useAdaptiveEscrow();

  const flaggedTransactions: FlaggedTxn[] = transactions
    .filter((tx) => tx.riskLevel !== "low")
    .map((tx) => ({
      id: tx.id,
      buyer: "Arjun Mehta",
      seller: tx.counterpartyName,
      amount: tx.amount,
      riskScore: tx.riskScore,
      flags: tx.risk.flags,
      status: tx.status === "Frozen" ? "frozen" : tx.status === "Disputed" ? "reviewing" : "pending",
      rolling: tx.risk.rollingWindowScore,
      cusum: tx.risk.cusumScore,
      surge: tx.risk.surgeRatio,
      date: new Date(tx.createdAt).toLocaleString(),
    }));

  const filtered = flaggedTransactions.filter((txn) => {
    const matchesSearch =
      txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.seller.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || txn.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-display text-foreground">Flagged Transactions</h1>
          <p className="text-muted-foreground text-sm mt-1">Review and manage transactions flagged by risk detection</p>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-fintech mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Filters</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              placeholder="Search by TXN ID, buyer, or seller"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-xl"
            />
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="reviewing">Under Review</SelectItem>
                <SelectItem value="frozen">Frozen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Alert className="bg-destructive/10 border-destructive/20">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              {filtered.filter((t) => t.status === 'pending').length} transactions pending review.{' '}
              {filtered.filter((t) => t.status === 'frozen').length} transactions frozen.
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Transactions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-fintech"
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Parties</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-mono text-sm font-semibold">{txn.id}</TableCell>
                    <TableCell className="text-sm">
                      <div>
                        <p className="font-medium">{txn.buyer}</p>
                        <p className="text-xs text-muted-foreground">→ {txn.seller}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">₹{txn.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <RiskIndicator
                        level={
                          txn.riskScore > 80 ? 'high' : txn.riskScore > 50 ? 'medium' : 'low'
                        }
                        score={txn.riskScore}
                        showTooltip={false}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {txn.flags.slice(0, 2).map((flag, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs bg-destructive/5 text-destructive border-destructive/20"
                          >
                            {flag}
                          </Badge>
                        ))}
                        {txn.flags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{txn.flags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`status-badge ${
                          txn.status === 'pending'
                            ? 'bg-primary/10 text-primary'
                            : txn.status === 'reviewing'
                              ? 'bg-yellow-500/10 text-yellow-600'
                              : 'bg-destructive/10 text-destructive'
                        }`}
                      >
                        {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg text-xs"
                            onClick={() => setSelectedTxn(txn)}
                          >
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl rounded-2xl">
                          <DialogHeader>
                            <DialogTitle>{selectedTxn?.id}</DialogTitle>
                            <DialogDescription>
                              Review detailed risk analysis for this transaction
                            </DialogDescription>
                          </DialogHeader>

                          {selectedTxn && (
                            <div className="space-y-6">
                              {/* Transaction Info */}
                              <div className="grid sm:grid-cols-2 gap-4 px-4">
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Buyer</p>
                                  <p className="font-medium text-foreground">{selectedTxn.buyer}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Seller</p>
                                  <p className="font-medium text-foreground">{selectedTxn.seller}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Amount</p>
                                  <p className="font-bold text-lg text-foreground">
                                    ₹{selectedTxn.amount.toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Date</p>
                                  <p className="font-medium text-foreground">{selectedTxn.date}</p>
                                </div>
                              </div>

                              {/* Risk Analysis */}
                              <div className="px-4">
                                <RiskExplanation
                                  rolling={{
                                    score: selectedTxn.rolling,
                                    explanation: 'Rolling window anomaly score',
                                  }}
                                  cusum={{
                                    score: selectedTxn.cusum,
                                    explanation: 'Cumulative sum control chart',
                                  }}
                                  surge={{
                                    ratio: selectedTxn.surge,
                                    explanation: 'Transaction surge ratio',
                                  }}
                                  overall={{
                                    level:
                                      selectedTxn.riskScore > 80
                                        ? 'high'
                                        : selectedTxn.riskScore > 50
                                          ? 'medium'
                                          : 'low',
                                    reason: `Risk score: ${(selectedTxn.riskScore/100).toFixed(4)}/1`,
                                  }}
                                />
                              </div>

                              {/* Flags */}
                              <div className="px-4">
                                <p className="text-sm font-medium text-foreground mb-3">Triggered Flags</p>
                                <div className="flex flex-wrap gap-2">
                                  {selectedTxn.flags.map((flag, idx) => (
                                    <Badge
                                      key={idx}
                                      className="bg-destructive/10 text-destructive border-destructive/20"
                                    >
                                      {flag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="px-4 border-t border-border pt-4 flex gap-2">
                                {selectedTxn.status !== 'frozen' && (
                                  <Button
                                    className="flex-1 rounded-xl gap-2"
                                    variant="destructive"
                                    onClick={() => freezeTransaction(selectedTxn.id)}
                                  >
                                    <Lock className="h-4 w-4" /> Freeze Transaction
                                  </Button>
                                )}
                                {selectedTxn.status === 'frozen' && (
                                  <Button className="flex-1 rounded-xl gap-2" onClick={() => releaseFunds(selectedTxn.id)}>
                                    <Unlock className="h-4 w-4" /> Release Transaction
                                  </Button>
                                )}
                                <Button className="flex-1 rounded-xl gap-2" variant="outline" onClick={() => markAsFraud(selectedTxn.id)}>
                                  <Flag className="h-4 w-4" /> Mark as Fraud
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default FlaggedTransactions;
