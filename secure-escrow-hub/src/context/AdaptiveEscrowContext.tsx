import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type RiskLevel = "low" | "medium" | "high";
export type TransactionStatus = "Initiated" | "Locked" | "In Progress" | "Released" | "Disputed" | "Frozen";

export interface RiskSignals {
  rollingWindowScore: number;
  cusumScore: number;
  surgeRatio: number;
  explanation: string;
  flags: string[];
}

export interface EscrowTransaction {
  id: string;
  counterpartyId: string;
  counterpartyName: string;
  amount: number;
  status: TransactionStatus;
  riskScore: number;
  riskLevel: RiskLevel;
  kycStatus: "Verified" | "Pending" | "Rejected";
  createdAt: string;
  terms: string;
  risk: RiskSignals;
  timeline: Array<{ label: string; date: string; done: boolean }>;
}

export interface CounterpartyProfile {
  id: string;
  name: string;
  reliabilityScore: number;
  transactionSummary: string;
  disputeHistory: string;
  accountAge: string;
}

export interface PlatformUser {
  id: string;
  name: string;
  kycStatus: "Verified" | "Pending" | "Rejected";
  reliabilityScore: number;
  trustScore: number;
  restricted: boolean;
}

export interface DisputeRecord {
  id: string;
  transactionId: string;
  buyer: string;
  seller: string;
  status: "Open" | "Reviewing" | "Escalated" | "Resolved";
  evidenceCount: number;
  latestMessage: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: "risk" | "transaction" | "dispute";
  title: string;
  detail: string;
  createdAt: string;
  read: boolean;
}

interface AdaptiveEscrowState {
  reliabilityScore: number;
  riskLevel: RiskLevel;
  kycStatus: "Verified" | "Pending" | "Rejected";
  wallet: {
    availableBalance: number;
    lockedFunds: number;
    pendingTransactions: number;
  };
  transactions: EscrowTransaction[];
  counterparties: CounterpartyProfile[];
  users: PlatformUser[];
  disputes: DisputeRecord[];
  notifications: NotificationItem[];
  createTransaction: (payload: {
    amount: number;
    counterparty: string;
    terms: string;
  }) => EscrowTransaction;
  confirmDelivery: (transactionId: string) => void;
  raiseDispute: (transactionId: string) => void;
  freezeTransaction: (transactionId: string) => void;
  releaseFunds: (transactionId: string) => void;
  markAsFraud: (transactionId: string) => void;
  adjustTrustScore: (userId: string, delta: number) => void;
  restrictAccount: (userId: string) => void;
  flagUser: (userId: string) => void;
  markAllNotificationsRead: () => void;
}

const AdaptiveEscrowContext = createContext<AdaptiveEscrowState | null>(null);

const now = new Date();
const withOffset = (minutes: number) => new Date(now.getTime() - minutes * 60_000).toISOString();

const initialTransactions: EscrowTransaction[] = [
  {
    id: "TXN-2301",
    counterpartyId: "usr-2",
    counterpartyName: "Priya Sharma",
    amount: 15000,
    status: "In Progress",
    riskScore: 34,
    riskLevel: "low",
    kycStatus: "Verified",
    createdAt: withOffset(240),
    terms: "Deliver logo and brand guide by Apr 12",
    risk: {
      rollingWindowScore: 22,
      cusumScore: 18,
      surgeRatio: 1.2,
      explanation: "Pattern is within baseline with no unusual spikes",
      flags: ["Rolling: stable"],
    },
    timeline: [
      { label: "Initiated", date: "Apr 07, 2026 09:10", done: true },
      { label: "Locked", date: "Apr 07, 2026 09:14", done: true },
      { label: "In Progress", date: "Apr 07, 2026 10:01", done: true },
      { label: "Released", date: "Pending", done: false },
    ],
  },
  {
    id: "TXN-2302",
    counterpartyId: "usr-3",
    counterpartyName: "Apex Electronics",
    amount: 95000,
    status: "Locked",
    riskScore: 74,
    riskLevel: "high",
    kycStatus: "Pending",
    createdAt: withOffset(120),
    terms: "Batch delivery in two lots with QA checks",
    risk: {
      rollingWindowScore: 67,
      cusumScore: 72,
      surgeRatio: 2.9,
      explanation: "High amount and sudden velocity spike against historical baseline",
      flags: ["CUSUM", "Surge", "Rolling"],
    },
    timeline: [
      { label: "Initiated", date: "Apr 07, 2026 11:10", done: true },
      { label: "Locked", date: "Apr 07, 2026 11:20", done: true },
      { label: "In Progress", date: "Pending", done: false },
      { label: "Released", date: "Pending", done: false },
    ],
  },
  {
    id: "TXN-2303",
    counterpartyId: "usr-4",
    counterpartyName: "Ravi Verma",
    amount: 42000,
    status: "Disputed",
    riskScore: 81,
    riskLevel: "high",
    kycStatus: "Verified",
    createdAt: withOffset(60),
    terms: "Delivery delayed beyond SLA",
    risk: {
      rollingWindowScore: 64,
      cusumScore: 80,
      surgeRatio: 2.5,
      explanation: "Dispute created after pattern drift and message inconsistency",
      flags: ["CUSUM", "Behavior drift"],
    },
    timeline: [
      { label: "Initiated", date: "Apr 07, 2026 13:20", done: true },
      { label: "Locked", date: "Apr 07, 2026 13:26", done: true },
      { label: "In Progress", date: "Apr 07, 2026 13:49", done: true },
      { label: "Disputed", date: "Apr 07, 2026 14:05", done: true },
      { label: "Released", date: "Pending", done: false },
    ],
  },
];

const initialCounterparties: CounterpartyProfile[] = [
  {
    id: "usr-2",
    name: "Priya Sharma",
    reliabilityScore: 91,
    transactionSummary: "34 completed transactions, 97% on-time",
    disputeHistory: "1 resolved dispute in last 12 months",
    accountAge: "2 years 4 months",
  },
  {
    id: "usr-3",
    name: "Apex Electronics",
    reliabilityScore: 68,
    transactionSummary: "12 completed transactions, variable settlement time",
    disputeHistory: "2 active disputes",
    accountAge: "8 months",
  },
  {
    id: "usr-4",
    name: "Ravi Verma",
    reliabilityScore: 57,
    transactionSummary: "9 completed transactions",
    disputeHistory: "3 disputes in the last quarter",
    accountAge: "6 months",
  },
];

const initialUsers: PlatformUser[] = [
  { id: "usr-1", name: "Arjun Mehta", kycStatus: "Verified", reliabilityScore: 84, trustScore: 80, restricted: false },
  { id: "usr-2", name: "Priya Sharma", kycStatus: "Verified", reliabilityScore: 91, trustScore: 89, restricted: false },
  { id: "usr-3", name: "Apex Electronics", kycStatus: "Pending", reliabilityScore: 68, trustScore: 59, restricted: false },
  { id: "usr-4", name: "Ravi Verma", kycStatus: "Verified", reliabilityScore: 57, trustScore: 48, restricted: true },
];

const initialDisputes: DisputeRecord[] = [
  {
    id: "DSP-901",
    transactionId: "TXN-2303",
    buyer: "Arjun Mehta",
    seller: "Ravi Verma",
    status: "Reviewing",
    evidenceCount: 4,
    latestMessage: "Buyer submitted delivery delay screenshots",
    createdAt: withOffset(52),
  },
  {
    id: "DSP-900",
    transactionId: "TXN-2290",
    buyer: "Neha R",
    seller: "Apex Electronics",
    status: "Escalated",
    evidenceCount: 6,
    latestMessage: "Conflicting invoice metadata",
    createdAt: withOffset(600),
  },
];

const initialNotifications: NotificationItem[] = [
  {
    id: "ntf-1",
    type: "risk",
    title: "High risk transaction detected",
    detail: "TXN-2302 crossed surge ratio threshold (2.9x)",
    createdAt: withOffset(20),
    read: false,
  },
  {
    id: "ntf-2",
    type: "transaction",
    title: "Transaction moved to In Progress",
    detail: "TXN-2301 accepted by counterparty",
    createdAt: withOffset(40),
    read: false,
  },
  {
    id: "ntf-3",
    type: "dispute",
    title: "Dispute update",
    detail: "DSP-901 received new evidence",
    createdAt: withOffset(55),
    read: true,
  },
];

const getRiskLevel = (score: number): RiskLevel => {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
};

export const AdaptiveEscrowProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<EscrowTransaction[]>(initialTransactions);
  const [counterparties] = useState<CounterpartyProfile[]>(initialCounterparties);
  const [users, setUsers] = useState<PlatformUser[]>(initialUsers);
  const [disputes, setDisputes] = useState<DisputeRecord[]>(initialDisputes);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNotifications((prev) => {
        const latest = prev[0];
        const riskTx = transactions.find((tx) => tx.riskLevel !== "low");
        const message = riskTx
          ? `Transaction ${riskTx.id} remains ${riskTx.riskLevel} risk (${riskTx.riskScore}/100)`
          : "No high-risk transaction in current polling window";

        return [
          {
            id: `ntf-poll-${Date.now()}`,
            type: "risk",
            title: "Risk monitor refresh",
            detail: message,
            createdAt: new Date().toISOString(),
            read: false,
          },
          ...(latest ? prev.slice(0, 11) : prev),
        ];
      });
    }, 20000);

    return () => window.clearInterval(interval);
  }, [transactions]);

  const createTransaction: AdaptiveEscrowState["createTransaction"] = ({ amount, counterparty, terms }) => {
    const riskScore = amount > 100000 ? 84 : amount > 50000 ? 58 : 26;
    const next: EscrowTransaction = {
      id: `TXN-${2300 + transactions.length + 1}`,
      counterpartyId: `usr-${transactions.length + 10}`,
      counterpartyName: counterparty,
      amount,
      status: "Initiated",
      riskScore,
      riskLevel: getRiskLevel(riskScore),
      kycStatus: "Pending",
      createdAt: new Date().toISOString(),
      terms,
      risk: {
        rollingWindowScore: Math.max(10, Math.round(riskScore * 0.8)),
        cusumScore: Math.max(8, Math.round(riskScore * 0.9)),
        surgeRatio: amount > 100000 ? 3.1 : amount > 50000 ? 1.9 : 1.2,
        explanation:
          riskScore >= 70
            ? "High amount compared to account baseline and velocity surge"
            : riskScore >= 40
              ? "Moderate amount increase over rolling baseline"
              : "Within expected transaction behavior",
        flags: riskScore >= 70 ? ["CUSUM", "Surge"] : riskScore >= 40 ? ["Rolling"] : ["Baseline"],
      },
      timeline: [
        { label: "Initiated", date: new Date().toLocaleString(), done: true },
        { label: "Locked", date: "Pending", done: false },
        { label: "In Progress", date: "Pending", done: false },
        { label: "Released", date: "Pending", done: false },
      ],
    };

    setTransactions((prev) => [next, ...prev]);
    setNotifications((prev) => [
      {
        id: `ntf-${Date.now()}`,
        type: "transaction",
        title: `Transaction ${next.id} created`,
        detail: `Risk level ${next.riskLevel.toUpperCase()} with score ${next.riskScore}`,
        createdAt: new Date().toISOString(),
        read: false,
      },
      ...prev,
    ]);

    return next;
  };

  const confirmDelivery = (transactionId: string) => {
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === transactionId
          ? {
              ...tx,
              status: "Released",
              timeline: tx.timeline.map((step) =>
                step.label === "Released" ? { ...step, done: true, date: new Date().toLocaleString() } : step,
              ),
            }
          : tx,
      ),
    );
  };

  const raiseDispute = (transactionId: string) => {
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === transactionId
          ? {
              ...tx,
              status: "Disputed",
              riskScore: Math.min(100, tx.riskScore + 8),
              riskLevel: "high",
            }
          : tx,
      ),
    );

    setDisputes((prev) => [
      {
        id: `DSP-${900 + prev.length + 1}`,
        transactionId,
        buyer: "Arjun Mehta",
        seller: transactions.find((tx) => tx.id === transactionId)?.counterpartyName || "Unknown",
        status: "Open",
        evidenceCount: 1,
        latestMessage: "Dispute created by buyer",
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const freezeTransaction = (transactionId: string) => {
    setTransactions((prev) => prev.map((tx) => (tx.id === transactionId ? { ...tx, status: "Frozen" } : tx)));
  };

  const releaseFunds = (transactionId: string) => {
    setTransactions((prev) => prev.map((tx) => (tx.id === transactionId ? { ...tx, status: "Released" } : tx)));
  };

  const markAsFraud = (transactionId: string) => {
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === transactionId
          ? {
              ...tx,
              riskScore: 99,
              riskLevel: "high",
              status: "Frozen",
              risk: {
                ...tx.risk,
                explanation: "Marked as fraud after manual admin review",
                flags: [...tx.risk.flags, "Manual fraud mark"],
              },
            }
          : tx,
      ),
    );
  };

  const adjustTrustScore = (userId: string, delta: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, trustScore: Math.max(0, Math.min(100, user.trustScore + delta)) } : user,
      ),
    );
  };

  const restrictAccount = (userId: string) => {
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, restricted: !user.restricted } : user)));
  };

  const flagUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, reliabilityScore: Math.max(0, user.reliabilityScore - 7), trustScore: Math.max(0, user.trustScore - 10) }
          : user,
      ),
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const highRiskCount = transactions.filter((tx) => tx.riskLevel === "high").length;

  const value = useMemo<AdaptiveEscrowState>(
    () => ({
      reliabilityScore: 84,
      riskLevel: highRiskCount > 0 ? "medium" : "low",
      kycStatus: "Verified",
      wallet: {
        availableBalance: 24500,
        lockedFunds: transactions
          .filter((tx) => tx.status === "Locked" || tx.status === "In Progress" || tx.status === "Frozen")
          .reduce((sum, tx) => sum + tx.amount, 0),
        pendingTransactions: transactions.filter((tx) => tx.status !== "Released").length,
      },
      transactions,
      counterparties,
      users,
      disputes,
      notifications,
      createTransaction,
      confirmDelivery,
      raiseDispute,
      freezeTransaction,
      releaseFunds,
      markAsFraud,
      adjustTrustScore,
      restrictAccount,
      flagUser,
      markAllNotificationsRead,
    }),
    [transactions, counterparties, users, disputes, notifications, highRiskCount],
  );

  return <AdaptiveEscrowContext.Provider value={value}>{children}</AdaptiveEscrowContext.Provider>;
};

export const useAdaptiveEscrow = () => {
  const context = useContext(AdaptiveEscrowContext);
  if (!context) {
    throw new Error("useAdaptiveEscrow must be used within AdaptiveEscrowProvider");
  }
  return context;
};
