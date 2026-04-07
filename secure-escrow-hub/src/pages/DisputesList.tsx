import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAdaptiveEscrow } from "@/context/AdaptiveEscrowContext";

const statusColor: Record<string, string> = {
  open: "bg-destructive/10 text-destructive",
  resolved: "bg-accent/10 text-accent",
  pending: "bg-warning/10 text-warning",
};

const DisputesListPage = () => {
  const { disputes } = useAdaptiveEscrow();

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              Disputes
            </h1>
            <p className="text-muted-foreground text-sm mt-1">All disputes for your transactions</p>
          </div>
        </div>

        {disputes.length === 0 ? (
          <div className="card-fintech text-center py-16 text-muted-foreground">
            <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No disputes found</p>
            <p className="text-sm mt-1">You don't have any active or past disputes.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {disputes.map((dispute, i) => (
              <motion.div
                key={dispute.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-fintech flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground truncate">
                      Escrow #{dispute.transactionId?.slice(0, 8)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[dispute.status.toLowerCase()] || "bg-muted text-muted-foreground"}`}>
                      {dispute.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{dispute.latestMessage}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(dispute.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm" className="rounded-xl shrink-0">
                  <Link to={`/disputes/${dispute.id}`}>
                    View <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DisputesListPage;
