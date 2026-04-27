import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CreateTransaction = lazy(() => import("./pages/CreateTransaction"));
const TransactionDetails = lazy(() => import("./pages/TransactionDetails"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const WalletPage = lazy(() => import("./pages/Wallet"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const DisputePage = lazy(() => import("./pages/Disputes"));
const DisputesListPage = lazy(() => import("./pages/DisputesList"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Notifications = lazy(() => import("./pages/Notifications"));
const CounterpartyProfile = lazy(() => import("./pages/CounterpartyProfile"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const FlaggedTransactions = lazy(() => import("./pages/admin/FlaggedTransactions"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const RiskAnalysis = lazy(() => import("./pages/admin/RiskAnalysis"));
const AdminDisputes = lazy(() => import("./pages/admin/AdminDisputes"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const KYC = lazy(() => import("./pages/KYC"));
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import { AdaptiveEscrowProvider } from "./context/AdaptiveEscrowContext";
import { UserProvider } from "./context/UserContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <AdaptiveEscrowProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading...</div>}>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-transaction" element={<CreateTransaction />} />
              <Route path="/create-escrow" element={<CreateTransaction />} />
              <Route path="/transaction/:id" element={<TransactionDetails />} />
              <Route path="/counterparty/:id" element={<CounterpartyProfile />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/kyc" element={<KYC />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/disputes" element={<DisputesListPage />} />
              <Route path="/disputes/:id" element={<DisputePage />} />

              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminProtectedRoute />}>
                <Route index element={<AdminDashboard />} />
                <Route path="flagged" element={<FlaggedTransactions />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="risk-analysis" element={<RiskAnalysis />} />
                <Route path="disputes" element={<AdminDisputes />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AdaptiveEscrowProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
