import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, AlertTriangle, CheckCircle2, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { RiskIndicator } from "@/components/common/RiskIndicator";
import { RiskExplanation } from "@/components/common/RiskExplanation";
import { useAdaptiveEscrow } from "@/context/AdaptiveEscrowContext";

const TransactionDetails = () => {
  const { id } = useParams();
  const { transactions, confirmDelivery, raiseDispute } = useAdaptiveEscrow();
  const [escrowData, setEscrowData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEscrowDetails = async () => {
      try {
        const response = await escrowApi.getEscrowById(id!);
        if (response.success) {
          setEscrowData(response.escrow);
        }
      } catch (error) {
        console.error('Failed to fetch escrow details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEscrowDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
            <div className="card-fintech space-y-4">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!escrowData) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-muted-foreground">No transaction found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Button asChild variant="ghost" size="sm" className="rounded-xl">
            <Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground">{escrowData.id}</h1>
            <p className="text-muted-foreground text-sm">Transaction Details</p>
          </div>
          <span className="ml-auto status-badge bg-primary/10 text-primary">{escrowData.state}</span>
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
                    <span className="font-medium text-foreground">{escrowData.buyer?.full_name || escrowData.buyer?.email || 'Unknown'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Seller</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-accent" />
                    <span className="font-medium text-foreground">{escrowData.seller?.full_name || escrowData.seller?.email || 'Unknown'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Amount</p>
                  <span className="font-bold text-foreground text-lg">₹{escrowData.amount?.toLocaleString()}</span>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Status</p>
                  <span className="font-medium text-foreground">{escrowData.state}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">{escrowData.description || 'No description provided'}</p>
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
                {transaction.timeline.map((step, i) => (
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
              <Button className="rounded-xl" onClick={() => confirmDelivery(transaction.id)}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm Delivery
              </Button>
              <Button
                variant="outline"
                className="rounded-xl text-destructive hover:text-destructive"
                onClick={() => raiseDispute(transaction.id)}
              >
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
              <div className="mb-4">
                <RiskIndicator
                  level={transaction.riskLevel}
                  score={transaction.riskScore}
                  reason={transaction.risk.explanation}
                  details={`Flags: ${transaction.risk.flags.join(", ")}`}
                  showTooltip={false}
                />
              </div>

              <RiskExplanation
                rolling={{ score: transaction.risk.rollingWindowScore, explanation: "Rolling window anomaly score" }}
                cusum={{ score: transaction.risk.cusumScore, explanation: "CUSUM trend divergence score" }}
                surge={{ ratio: transaction.risk.surgeRatio, explanation: "Surge ratio against recent baseline" }}
                overall={{ level: transaction.riskLevel, reason: transaction.risk.explanation }}
              />
            </div>

            <div className="card-fintech">
              <h3 className="text-sm font-semibold font-display text-foreground mb-3">Verification</h3>
              <div className="space-y-2">
                {["Identity check complete", "Payment method verified", "Device baseline healthy"].map((v) => (
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
