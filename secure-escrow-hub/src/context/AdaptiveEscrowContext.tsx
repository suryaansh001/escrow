import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { dashboardApi, escrowApi, securityApi } from "@/lib/api";

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
    tx_hash_create?: string;
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
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Fetch dashboard data from backend
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, usersResponse] = await Promise.all([
        dashboardApi.getDashboardData(),
        dashboardApi.listUsers()
      ]);

      if (dashboardResponse.success && usersResponse.success) {
        setDashboardData(dashboardResponse.data);
        setUsers(usersResponse.users || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Create transaction using backend API with PIN verification
  const createTransaction: AdaptiveEscrowState["createTransaction"] = async ({ amount, counterparty, terms, tx_hash_create }) => {
    try {
      // PIN verification will be handled in the UI component
      // Create escrow via backend
      const response = await escrowApi.createEscrow({
        amount,
        counterparty_name: counterparty,
        description: terms,
        tx_hash_create,
      });

      if (response.success) {
        // Refresh dashboard data
        await fetchDashboardData();

        // Add notification
        setNotifications((prev) => [
          {
            id: `ntf-${Date.now()}`,
            type: "transaction",
            title: "Transaction created successfully",
            detail: `Escrow created for ₹${amount.toLocaleString()} with ${counterparty}`,
            createdAt: new Date().toISOString(),
            read: false,
          },
          ...prev,
        ]);

        return response.data;
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create transaction');
    }
  };

  // Mock functions for now (can be implemented later)
  const confirmDelivery = (transactionId: string) => {
    // TODO: Implement backend call
    console.log('Confirm delivery:', transactionId);
  };

  const raiseDispute = (transactionId: string) => {
    // TODO: Implement backend call
    console.log('Raise dispute:', transactionId);
  };

  const freezeTransaction = (transactionId: string) => {
    // TODO: Implement backend call
    console.log('Freeze transaction:', transactionId);
  };

  const releaseFunds = (transactionId: string) => {
    // TODO: Implement backend call
    console.log('Release funds:', transactionId);
  };

  const markAsFraud = (transactionId: string) => {
    // TODO: Implement backend call
    console.log('Mark as fraud:', transactionId);
  };

  const adjustTrustScore = (userId: string, delta: number) => {
    // TODO: Implement backend call
    console.log('Adjust trust score:', userId, delta);
  };

  const restrictAccount = (userId: string) => {
    // TODO: Implement backend call
    console.log('Restrict account:', userId);
  };

  const flagUser = (userId: string) => {
    // TODO: Implement backend call
    console.log('Flag user:', userId);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  // Default values while loading
  const defaultWallet = {
    availableBalance: 0,
    lockedFunds: 0,
    pendingTransactions: 0,
  };

  const value = useMemo<AdaptiveEscrowState>(
    () => {
      // Map backend risk levels to frontend RiskLevel type
      const mapRiskLevel = (backendRisk: string): RiskLevel => {
        switch (backendRisk?.toLowerCase()) {
          case 'normal':
            return 'low';
          case 'monitor':
            return 'medium';
          case 'restrict':
          case 'freeze':
            return 'high';
          default:
            return 'low'; // Default fallback
        }
      };

      return {
        reliabilityScore: dashboardData?.user?.reliability_score || 0,
        riskLevel: mapRiskLevel(dashboardData?.riskProfile?.level),
        kycStatus: dashboardData?.user?.kyc_status || "Pending",
        wallet: {
          availableBalance: dashboardData?.metrics?.walletBalance || 0,
          lockedFunds: dashboardData?.metrics?.activeEscrows || 0,
          pendingTransactions: dashboardData?.metrics?.activeEscrows || 0,
        },
      transactions: dashboardData?.recentTransactions?.map((tx: any) => {
        // Map backend risk levels to frontend RiskLevel type
        const mapRiskLevel = (backendRisk: string): RiskLevel => {
          switch (backendRisk.toLowerCase()) {
            case 'normal':
              return 'low';
            case 'monitor':
              return 'medium';
            case 'restrict':
            case 'freeze':
              return 'high';
            default:
              return 'low'; // Default fallback
          }
        };

        return {
          id: tx.id,
          counterpartyId: '', // Backend doesn't provide ID, using empty string
          counterpartyName: tx.counterparty,
          amount: tx.amount,
          status: (tx.state.charAt(0).toUpperCase() + tx.state.slice(1)) as TransactionStatus,
          riskScore: Math.round(tx.final_score * 100), // Convert to 0-100 scale
          riskLevel: mapRiskLevel(tx.risk),
          kycStatus: "Verified" as const, // Default to verified for now
          createdAt: tx.createdAt,
          terms: `Transaction with ${tx.counterparty}`, // Default terms based on counterparty
          risk: {
            rollingWindowScore: Math.round(tx.final_score * 100),
            cusumScore: Math.round(tx.final_score * 100),
            surgeRatio: 1,
            explanation: `Risk score: ${Math.round(tx.final_score * 100)}%`,
            flags: tx.final_score > 0.5 ? ["High Risk"] : [],
          },
          timeline: [
            { label: "Initiated", date: new Date(tx.createdAt).toLocaleString(), done: true },
            { label: "Locked", date: "Pending", done: tx.state !== 'created' },
            { label: "In Progress", date: "Pending", done: tx.state === 'funded' || tx.state === 'released' },
            { label: "Released", date: "Pending", done: tx.state === 'released' },
          ],
        };
      }) || [],
      counterparties: users.map((user: any) => ({
        id: user.id,
        name: user.full_name,
        reliabilityScore: Math.round(user.reliability_score * 100),
        transactionSummary: `${Math.floor(Math.random() * 50) + 1} completed transactions`,
        disputeHistory: `${Math.floor(Math.random() * 3)} resolved disputes`,
        accountAge: `${Math.floor(Math.random() * 3) + 1} years`,
      })),
      users: users.map((user: any) => ({
        id: user.id,
        name: user.full_name,
        kycStatus: user.kyc_status as "Verified" | "Pending" | "Rejected",
        reliabilityScore: Math.round(user.reliability_score * 100),
        trustScore: Math.round(user.reliability_score * 100),
        restricted: false,
      })),
      disputes: [], // TODO: Fetch disputes
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
    };
  }, [dashboardData, notifications]);

  return <AdaptiveEscrowContext.Provider value={value}>{children}</AdaptiveEscrowContext.Provider>;
};

export const useAdaptiveEscrow = () => {
  const context = useContext(AdaptiveEscrowContext);
  if (!context) {
    throw new Error("useAdaptiveEscrow must be used within AdaptiveEscrowProvider");
  }
  return context;
};
