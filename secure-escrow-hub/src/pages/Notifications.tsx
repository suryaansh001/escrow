import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAdaptiveEscrow } from "@/context/AdaptiveEscrowContext";
import { AlertTriangle, Bell, ShieldAlert, MessageSquareWarning } from "lucide-react";
import { Button } from "@/components/ui/button";

const iconMap = {
  risk: ShieldAlert,
  transaction: Bell,
  dispute: MessageSquareWarning,
};

const Notifications = () => {
  const { notifications, markAllNotificationsRead } = useAdaptiveEscrow();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground">Notifications</h1>
            <p className="text-muted-foreground text-sm mt-1">Live updates via polling every 20 seconds.</p>
          </div>
          <Button variant="outline" className="rounded-xl" onClick={markAllNotificationsRead}>
            Mark all as read
          </Button>
        </div>

        <div className="space-y-3">
          {notifications.map((item) => {
            const Icon = iconMap[item.type];
            return (
              <div key={item.id} className={`card-fintech ${item.read ? "opacity-80" : "border-primary/30"}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${item.type === "risk" ? "bg-destructive/10" : "bg-primary/10"}`}>
                    <Icon className={`h-4 w-4 ${item.type === "risk" ? "text-destructive" : "text-primary"}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      {!item.read && <span className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.detail}</p>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {notifications.length === 0 && (
          <div className="card-fintech text-center py-12">
            <AlertTriangle className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No notifications available</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
