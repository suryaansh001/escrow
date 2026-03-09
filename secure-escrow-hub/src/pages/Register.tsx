import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Lock, Shield, Phone, User, AlertCircle, CheckCircle, Eye, EyeOff, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authApi, tokenStorage } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";

const PASSWORD_CHARS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?",
};

function generateStrongPassword(): string {
  const all = PASSWORD_CHARS.lower + PASSWORD_CHARS.upper + PASSWORD_CHARS.digits + PASSWORD_CHARS.symbols;
  const required = [
    PASSWORD_CHARS.lower[Math.floor(Math.random() * PASSWORD_CHARS.lower.length)],
    PASSWORD_CHARS.upper[Math.floor(Math.random() * PASSWORD_CHARS.upper.length)],
    PASSWORD_CHARS.digits[Math.floor(Math.random() * PASSWORD_CHARS.digits.length)],
    PASSWORD_CHARS.symbols[Math.floor(Math.random() * PASSWORD_CHARS.symbols.length)],
  ];
  const extra = Array.from({ length: 8 }, () => all[Math.floor(Math.random() * all.length)]);
  return [...required, ...extra].sort(() => Math.random() - 0.5).join("");
}

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 4) return { score, label: "Fair", color: "bg-yellow-500" };
  if (score === 5) return { score, label: "Good", color: "bg-blue-500" };
  return { score, label: "Strong", color: "bg-green-500" };
}

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const passwordStrength = getPasswordStrength(password);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name || name.trim().length < 3) {
      setError("Full name must be at least 3 characters");
      return;
    }

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number");
      return;
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      setError("Password must contain at least one special character");
      return;
    }

    try {
      setLoading(true);
      await authApi.requestOtp({ email, phone_number: phone });
      setOtpSent(true);
      setStep("otp");
      setSuccess("OTP sent to your email!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!otp) {
      setError("OTP is required");
      return;
    }

    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.register({
        email,
        password,
        otp,
        name,
        phone,
      });

      if (response.user) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForm = () => {
    setStep("form");
    setOtp("");
    setOtpSent(false);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="card-fintech !p-8">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold font-display text-foreground">Create Account</h1>
            </div>

            {/* Step indicator */}
            <div className="flex gap-2 mb-6">
              <div className={`flex-1 h-1 rounded-full ${step === "form" ? "bg-primary" : "bg-muted"}`}></div>
              <div className={`flex-1 h-1 rounded-full ${step === "otp" ? "bg-primary" : "bg-muted"}`}></div>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {step === "form" ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Arjun Mehta"
                      className="pl-10 rounded-xl"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="arjun@example.com"
                      className="pl-10 rounded-xl"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <Label>Phone</Label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="+91 98765 43210"
                      className="pl-10 rounded-xl"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label>Password</Label>
                    <button
                      type="button"
                      onClick={() => setPassword(generateStrongPassword())}
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                      disabled={loading}
                    >
                      <RefreshCw className="h-3 w-3" />
                      Generate strong password
                    </button>
                  </div>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 rounded-xl"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              i <= passwordStrength.score ? passwordStrength.color : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs ${
                        passwordStrength.label === "Weak" ? "text-red-500" :
                        passwordStrength.label === "Fair" ? "text-yellow-500" :
                        passwordStrength.label === "Good" ? "text-blue-500" : "text-green-600"
                      }`}>
                        {passwordStrength.label}
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6 rounded-xl h-11 font-semibold"
                  disabled={loading}
                >
                  {loading ? "Sending OTP..." : "Continue"}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="mb-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-foreground mb-1">
                    <span className="font-semibold">Email:</span> {email}
                  </p>
                  {phone && (
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">Phone:</span> {phone}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Enter OTP</Label>
                  <p className="text-xs text-muted-foreground mb-2">Check your email for the verification code</p>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="000000"
                      className="pl-10 rounded-xl text-center tracking-widest"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6 rounded-xl h-11 font-semibold"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>

                <button
                  type="button"
                  onClick={handleBackToForm}
                  className="text-xs text-primary hover:underline w-full text-center mt-2"
                >
                  Back to form
                </button>
              </form>
            )}

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">Login</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
