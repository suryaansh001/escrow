import { Badge } from "@/components/ui/badge";
import { User, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import { ScoreCard } from "@/components/common/ScoreCard";
import { RiskIndicator } from "@/components/common/RiskIndicator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CounterpartyProfileProps {
  userId: string;
  name: string;
  email: string;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  reliabilityScore: number;
  transactionCount: number;
  disputeCount: number;
  accountAge: number; // in days
  recentTransactions: Array<{
    id: string;
    amount: number;
    date: string;
    status: string;
  }>;
}

export const CounterpartyProfile = ({
  name,
  email,
  verificationStatus,
  reliabilityScore,
  transactionCount,
  disputeCount,
  accountAge,
  recentTransactions,
}: CounterpartyProfileProps) => {
  const riskLevel =
    reliabilityScore >= 80
      ? 'low'
      : reliabilityScore >= 50
        ? 'medium'
        : 'high';

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="card-fintech">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{email}</p>
            <div className="flex items-center gap-2 mt-3">
              <Badge
                variant="outline"
                className={`rounded-full ${
                  verificationStatus === 'verified'
                    ? 'bg-accent/10 text-accent border-accent/20'
                    : verificationStatus === 'pending'
                      ? 'bg-yellow-500/10 text-yellow-600 border-yellow-600/20'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1)}
              </Badge>
              {verificationStatus === 'verified' && (
                <span className="text-xs text-accent font-medium">KYC Verified</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <ScoreCard
          label="Reliability Score"
          value={(reliabilityScore/100).toFixed(4)}
          unit="/1"
          status={riskLevel === 'low' ? 'good' : riskLevel === 'medium' ? 'warning' : 'critical'}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <div className="card-fintech">
          <p className="text-sm font-medium text-muted-foreground mb-2">Risk Assessment</p>
          <RiskIndicator
            level={riskLevel}
            score={parseFloat(((100 - reliabilityScore)/100).toFixed(4))}
            reason={
              riskLevel === 'low'
                ? 'High reliability and low risk profile'
                : riskLevel === 'medium'
                  ? 'Moderate risk profile'
                  : 'High risk profile - review caution'
            }
            showTooltip={false}
          />
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-xs font-medium text-muted-foreground mb-2">Completed Transactions</p>
          <p className="text-2xl font-bold text-primary">{transactionCount}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-xs font-medium text-muted-foreground mb-2">Disputes</p>
          <p className={`text-2xl font-bold ${disputeCount > 0 ? 'text-destructive' : 'text-accent'}`}>
            {disputeCount}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-xs font-medium text-muted-foreground mb-2">Account Age</p>
          <p className="text-2xl font-bold text-primary">{Math.floor(accountAge / 30)}mo</p>
        </div>
      </div>

      {/* Risk Assessment */}
      {riskLevel !== 'low' && (
        <div className="card-fintech border-l-4 border-l-yellow-600 bg-yellow-500/5">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Review Caution</p>
              <p className="text-sm text-muted-foreground mt-1">
                This counterparty has a moderate-to-high risk profile. Consider reviewing their history
                and account verification status before proceeding with large transactions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="card-fintech">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4" /> Recent Transactions
        </h4>
        {recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-mono text-sm">{txn.id}</TableCell>
                    <TableCell className="font-semibold">₹{txn.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{txn.date}</TableCell>
                    <TableCell>
                      <span className="status-badge bg-accent/10 text-accent">
                        {txn.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No recent transactions</p>
        )}
      </div>
    </div>
  );
};
