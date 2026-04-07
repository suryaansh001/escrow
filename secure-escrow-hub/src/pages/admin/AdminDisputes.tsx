import AdminLayout from "@/components/layout/AdminLayout";
import { useAdaptiveEscrow } from "@/context/AdaptiveEscrowContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquareText, FileText } from "lucide-react";

const AdminDisputes = () => {
  const { disputes } = useAdaptiveEscrow();

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Dispute Resolution</h1>
          <p className="text-muted-foreground text-sm mt-1">Review evidence, chat logs, and issue outcomes.</p>
        </div>

        <div className="space-y-4">
          {disputes.map((dispute) => (
            <div key={dispute.id} className="card-fintech">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <p className="font-semibold text-foreground">{dispute.id}</p>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {dispute.status}
                </Badge>
                <p className="text-sm text-muted-foreground">Transaction {dispute.transactionId}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Parties</p>
                  <p className="text-sm text-foreground mt-1">{dispute.buyer} vs {dispute.seller}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Evidence Uploaded</p>
                  <p className="text-sm text-foreground mt-1">{dispute.evidenceCount} files</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/50 mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">Latest Log</p>
                <p className="text-sm text-foreground">{dispute.latestMessage}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button className="rounded-xl" size="sm">Approve Buyer</Button>
                <Button className="rounded-xl" variant="outline" size="sm">Approve Seller</Button>
                <Button className="rounded-xl" variant="outline" size="sm">Escalate Case</Button>
                <Button className="rounded-xl" variant="ghost" size="sm">
                  <FileText className="mr-1 h-3.5 w-3.5" /> Evidence
                </Button>
                <Button className="rounded-xl" variant="ghost" size="sm">
                  <MessageSquareText className="mr-1 h-3.5 w-3.5" /> Chat Logs
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDisputes;
