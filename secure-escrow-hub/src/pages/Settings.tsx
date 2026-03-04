import { motion } from "framer-motion";
import { User, Shield, Landmark, Bell, Lock, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import DashboardLayout from "@/components/layout/DashboardLayout";

const SettingsPage = () => {
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-display text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your account preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-fintech">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold font-display text-foreground">Profile</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Full Name</Label><Input defaultValue="Arjun Mehta" className="mt-1.5 rounded-xl" /></div>
              <div><Label>Email</Label><Input defaultValue="arjun@example.com" className="mt-1.5 rounded-xl" /></div>
              <div><Label>Phone</Label><Input defaultValue="+91 98765 43210" className="mt-1.5 rounded-xl" /></div>
            </div>
          </motion.div>

          {/* KYC */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-fintech">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-accent" />
              <h3 className="text-base font-semibold font-display text-foreground">KYC Verification</h3>
            </div>
            <div className="space-y-3 text-sm">
              {["Aadhaar Card", "PAN Card", "Bank Statement"].map((doc) => (
                <div key={doc} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <span className="text-foreground">{doc}</span>
                  <Button variant="outline" size="sm" className="rounded-xl">
                    <Upload className="mr-1 h-3 w-3" /> Upload
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Bank */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-fintech">
            <div className="flex items-center gap-2 mb-4">
              <Landmark className="h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold font-display text-foreground">Bank Details</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Account Number</Label><Input placeholder="XXXX XXXX 1234" className="mt-1.5 rounded-xl" /></div>
              <div><Label>IFSC Code</Label><Input placeholder="SBIN0001234" className="mt-1.5 rounded-xl" /></div>
            </div>
          </motion.div>

          {/* Security */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-fintech">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold font-display text-foreground">Security</h3>
            </div>
            <div className="space-y-4">
              <Button variant="outline" className="rounded-xl">Change Password</Button>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Switch />
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card-fintech">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold font-display text-foreground">Notifications</h3>
            </div>
            <div className="space-y-3">
              {["Email Notifications", "SMS Alerts", "Push Notifications"].map((n) => (
                <div key={n} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{n}</span>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
          </motion.div>

          <Button className="rounded-xl">Save Changes</Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
