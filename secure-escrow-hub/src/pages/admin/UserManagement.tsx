import { Users, ShieldAlert, ShieldCheck } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAdaptiveEscrow } from "@/context/AdaptiveEscrowContext";

const UserManagement = () => {
  const { users, adjustTrustScore, restrictAccount, flagUser } = useAdaptiveEscrow();

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">User Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Profile oversight with trust and KYC controls.</p>
        </div>

        <div className="card-fintech !p-0 overflow-hidden">
          <div className="p-6 pb-0 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold text-foreground">User Profiles</h3>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>KYC Status</TableHead>
                  <TableHead>Reliability</TableHead>
                  <TableHead>Trust Score</TableHead>
                  <TableHead>Account Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.kycStatus === "Verified"
                            ? "bg-accent/10 text-accent border-accent/20"
                            : "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
                        }
                      >
                        {user.kycStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.reliabilityScore}/100</TableCell>
                    <TableCell>{user.trustScore}/100</TableCell>
                    <TableCell>
                      {user.restricted ? (
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                          Restricted
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" className="rounded-lg" onClick={() => adjustTrustScore(user.id, 5)}>
                          + Trust
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-lg" onClick={() => adjustTrustScore(user.id, -5)}>
                          - Trust
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-lg" onClick={() => restrictAccount(user.id)}>
                          {user.restricted ? <ShieldCheck className="h-3.5 w-3.5 mr-1" /> : <ShieldAlert className="h-3.5 w-3.5 mr-1" />}
                          {user.restricted ? "Unrestrict" : "Restrict"}
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-lg" onClick={() => flagUser(user.id)}>
                          Flag User
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
