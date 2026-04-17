import { motion } from "framer-motion";
import { User, Shield, Landmark, Bell, Upload, Lock, Key } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { api, securityApi } from "@/lib/api";
import { useUser } from "@/context/UserContext";

const SettingsPage = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [bankLoading, setBankLoading] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [fullName] = useState("Arjun Mehta"); // Read-only - from Aadhaar/PAN
  const [email, setEmail] = useState("arjun@example.com");
  const [otpSent, setOtpSent] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  // Security PIN states
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinStep, setPinStep] = useState<'set' | 'update'>('set');

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/settings/profile', {
        email: email !== "arjun@example.com" ? email : undefined,
      });

      if (response.data.message.includes('OTP sent')) {
        setOtpEmail(email);
        setOtpSent(true);
        toast({
          title: "OTP Sent",
          description: "Please verify your email with the OTP sent.",
        });
      } else {
        toast({
          title: "Success",
          description: response.data.message || "Profile updated successfully",
        });
        setOtpSent(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/settings/verify-email', {
        email: otpEmail,
        otp: otp,
      });

      toast({
        title: "Success",
        description: "Email updated successfully",
      });
      setOtpSent(false);
      setOtp("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to verify OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBankDetailsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bankAccount || !ifscCode) {
      toast({
        title: "Error",
        description: "Both account number and IFSC code are required",
        variant: "destructive",
      });
      return;
    }

    setBankLoading(true);

    try {
      const response = await api.put('/settings/bank-details', {
        bank_account: bankAccount,
        bank_ifsc: ifscCode,
      });

      toast({
        title: "Success",
        description: response.data.message || "Bank details updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update bank details",
        variant: "destructive",
      });
    } finally {
      setBankLoading(false);
    }
  };

  const handleSetSecurityPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinLoading(true);

    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      toast({
        title: "Error",
        description: "Security PIN must be exactly 6 digits",
        variant: "destructive",
      });
      setPinLoading(false);
      return;
    }

    if (newPin !== confirmPin) {
      toast({
        title: "Error",
        description: "PINs do not match",
        variant: "destructive",
      });
      setPinLoading(false);
      return;
    }

    try {
      await securityApi.setPin(newPin);
      toast({
        title: "Success",
        description: "Security PIN set successfully",
      });
      setNewPin("");
      setConfirmPin("");
      setPinStep('update');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to set security PIN",
        variant: "destructive",
      });
    } finally {
      setPinLoading(false);
    }
  };

  const handleUpdateSecurityPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinLoading(true);

    if (currentPin.length !== 6 || newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      toast({
        title: "Error",
        description: "All PINs must be exactly 6 digits",
        variant: "destructive",
      });
      setPinLoading(false);
      return;
    }

    if (newPin !== confirmPin) {
      toast({
        title: "Error",
        description: "New PINs do not match",
        variant: "destructive",
      });
      setPinLoading(false);
      return;
    }

    try {
      await securityApi.updatePin(currentPin, newPin);
      toast({
        title: "Success",
        description: "Security PIN updated successfully",
      });
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update security PIN",
        variant: "destructive",
      });
    } finally {
      setPinLoading(false);
    }
  };

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
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input 
                  value={fullName} 
                  disabled 
                  className="mt-1.5 rounded-xl bg-muted" 
                  title="Name is fetched from your Aadhaar/PAN records and cannot be changed"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your name is automatically fetched from Aadhaar/PAN records and cannot be modified.
                </p>
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 rounded-xl" 
                />
              </div>
              <Button disabled={loading} className="rounded-xl">
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </form>

            {/* OTP Verification for Email */}
            {otpSent && (
              <form onSubmit={handleVerifyEmail} className="space-y-4 mt-6 pt-6 border-t">
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-xl">
                  <p className="text-sm text-blue-900 dark:text-blue-200">
                    An OTP has been sent to <strong>{otpEmail}</strong>
                  </p>
                </div>
                <div>
                  <Label>Enter OTP</Label>
                  <Input 
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="mt-1.5 rounded-xl"
                    maxLength={6}
                  />
                </div>
                <Button type="submit" disabled={loading || otp.length !== 6} className="rounded-xl">
                  {loading ? "Verifying..." : "Verify Email"}
                </Button>
              </form>
            )}
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
            <form onSubmit={handleBankDetailsUpdate} className="space-y-4">
              <div>
                <Label>Account Number</Label>
                <Input 
                  placeholder="XXXX XXXX 1234" 
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="mt-1.5 rounded-xl" 
                />
              </div>
              <div>
                <Label>IFSC Code</Label>
                <Input 
                  placeholder="SBIN0001234" 
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  className="mt-1.5 rounded-xl" 
                />
              </div>
              <Button disabled={bankLoading} className="rounded-xl">
                {bankLoading ? "Updating..." : "Update Bank Details"}
              </Button>
            </form>
          </motion.div>

          {/* Security PIN */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-fintech">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold font-display text-foreground">Security PIN</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Set a 6-digit PIN for transaction authorization and account security
            </p>
            {pinStep === 'set' ? (
              <form onSubmit={handleSetSecurityPin} className="space-y-4">
                <div>
                  <Label>New PIN (6 digits)</Label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Enter 6-digit PIN"
                    className="mt-1.5 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <Label>Confirm PIN</Label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="Confirm your PIN"
                    className="mt-1.5 rounded-xl"
                    required
                  />
                </div>
                <Button disabled={pinLoading} className="rounded-xl">
                  {pinLoading ? "Setting PIN..." : "Set Security PIN"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleUpdateSecurityPin} className="space-y-4">
                <div>
                  <Label>Current PIN</Label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value)}
                    placeholder="Enter current PIN"
                    className="mt-1.5 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <Label>New PIN (6 digits)</Label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Enter new 6-digit PIN"
                    className="mt-1.5 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <Label>Confirm New PIN</Label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="Confirm new PIN"
                    className="mt-1.5 rounded-xl"
                    required
                  />
                </div>
                <Button disabled={pinLoading} className="rounded-xl">
                  {pinLoading ? "Updating PIN..." : "Update Security PIN"}
                </Button>
              </form>
            )}
          </motion.div>
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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
