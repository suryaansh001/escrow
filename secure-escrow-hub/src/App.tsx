import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CreateEscrow from "./pages/CreateEscrow";
import TransactionDetails from "./pages/TransactionDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import WalletPage from "./pages/Wallet";
import SettingsPage from "./pages/Settings";
import DisputePage from "./pages/Disputes";
import DisputesListPage from "./pages/DisputesList";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-escrow" element={<CreateEscrow />} />
          <Route path="/transaction/:id" element={<TransactionDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/disputes" element={<DisputesListPage />} />
          <Route path="/disputes/:id" element={<DisputePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
