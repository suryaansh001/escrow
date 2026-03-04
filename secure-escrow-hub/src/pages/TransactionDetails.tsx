import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Shield, AlertTriangle, CheckCircle2, Clock, User, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";

const timelineSteps = [
  { label: "Escrow Created", date: "Jan 15, 2026", done: true },
  { label: "Funds Deposited", date: "Jan 15, 2026", done: true },
  { label: "Seller Accepted", date: "Jan 16, 2026", done: true },
  { label: "Delivery Confirmed", date: "Pending", done: false },
  { label: "Funds Released", date: "—", done: false },
];

const TransactionDetails = () => {
  const { id } = useParams();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Button asChild variant="ghost" size="sm" className="rounded-xl">
            <Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground">{id || "TXN-001"}</h1>
            <p className="text-muted-foreground text-sm">Transaction Details</p>
          </div>
          <span className="ml-auto status-badge bg-primary/10 text-primary">Funded</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-fintech"
            >
              <h3 className="text-base font-semibold font-display text-foreground mb-4">Transaction Info</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Buyer</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">Arjun Mehta</span>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Seller</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-accent" />
                    <span className="font-medium text-foreground">Priya Sharma</span>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Amount</p>
                  <span className="font-bold text-foreground text-lg">₹15,000</span>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Type</p>
                  <span className="font-medium text-foreground">Service</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <Button variant="outline" size="sm" className="rounded-xl">
                  <FileText className="mr-2 h-4 w-4" /> View Agreement
                </Button>
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-fintech"
            >
              <h3 className="text-base font-semibold font-display text-foreground mb-6">Timeline</h3>
              <div className="space-y-0">
                {timelineSteps.map((step, i) => (
                  <div key={step.label} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        step.done ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                      }`}>
                        {step.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                      </div>
                      {i < timelineSteps.length - 1 && (
                        <div className={`w-px h-8 ${step.done ? "bg-accent/40" : "bg-border"}`} />
                      )}
                    </div>
                    <div className="pb-8">
                      <p className={`text-sm font-medium ${step.done ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button className="rounded-xl">
                <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Delivered
              </Button>
              <Button variant="outline" className="rounded-xl">
                <Download className="mr-2 h-4 w-4" /> Release Funds
              </Button>
              <Button variant="outline" className="rounded-xl text-destructive hover:text-destructive">
                <AlertTriangle className="mr-2 h-4 w-4" /> Raise Dispute
              </Button>
            </div>
          </div>

          {/* Risk Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="card-fintech">
              <h3 className="text-base font-semibold font-display text-foreground mb-4">Risk Analysis</h3>

              <div className="flex justify-center mb-4">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="40" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
                    <circle
                      cx="48" cy="48" r="40" fill="none" stroke="hsl(var(--accent))" strokeWidth="6"
                      strokeDasharray={`${(18 / 100) * 251.3} 251.3`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold font-display text-foreground">18</span>
                    <span className="text-[10px] text-muted-foreground">/ 100</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fraud Likelihood</span>
                  <span className="font-medium text-accent">0.12x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Age Score</span>
                  <span className="font-medium text-foreground">92/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">KYC Status</span>
                  <span className="status-badge risk-badge-low text-xs">Verified</span>
                </div>
              </div>
            </div>

            <div className="card-fintech">
              <h3 className="text-sm font-semibold font-display text-foreground mb-3">Verification</h3>
              <div className="space-y-2">
                {["Aadhaar Verified", "PAN Verified", "Bank Verified"].map((v) => (
                  <div key={v} className="flex items-center gap-2 text-sm">
                    <Shield className="h-3.5 w-3.5 text-accent" />
                    <span className="text-foreground">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TransactionDetails;
