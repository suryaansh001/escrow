import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAdaptiveEscrow } from "@/context/AdaptiveEscrowContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { RiskIndicator } from "@/components/common/RiskIndicator";

const CounterpartyProfile = () => {
  const { id } = useParams();
  const { counterparties } = useAdaptiveEscrow();

  const profile = useMemo(() => counterparties.find((item) => item.id === id) || counterparties[0], [counterparties, id]);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="rounded-xl">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground">{profile.name}</h1>
            <p className="text-muted-foreground text-sm">Counterparty Profile</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-fintech space-y-4">
            <h3 className="text-base font-semibold text-foreground">Trust Overview</h3>
            <RiskIndicator
              level={profile.reliabilityScore > 80 ? "low" : profile.reliabilityScore > 60 ? "medium" : "high"}
              score={profile.reliabilityScore}
              reason="Reliability score based on fulfillment history and disputes"
            />
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">{profile.transactionSummary}</p>
              <p className="text-muted-foreground">{profile.disputeHistory}</p>
              <p className="text-muted-foreground">Account age: {profile.accountAge}</p>
            </div>
          </div>

          <div className="card-fintech">
            <h3 className="text-base font-semibold text-foreground mb-4">Risk Notes</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-accent mt-0.5" />
                Reliability includes completion consistency, dispute rate, and behavior drift.
              </p>
              <p>
                Every restriction or flag is logged in admin workflows with explicit reasons before action.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CounterpartyProfile;
