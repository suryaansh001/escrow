import { Shield, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { adminAuth } from "@/lib/adminAuth";

const AdminSettings = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    adminAuth.logout();
    navigate("/admin/login");
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Admin Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Demo controls for this frontend-only environment.</p>
        </div>

        <div className="card-fintech">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Admin Mode</p>
              <p className="text-sm text-muted-foreground mt-1">
                This panel is a demo frontend implementation. Actions are local-state only until backend endpoints are available.
              </p>
            </div>
          </div>
        </div>

        <div className="card-fintech">
          <p className="font-medium text-foreground mb-3">Session</p>
          <Button variant="outline" className="rounded-xl" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout Admin
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
