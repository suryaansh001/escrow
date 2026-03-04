import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Lock, Shield, Phone, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authApi, tokenStorage } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";

const Login = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Email login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // OTP login state
  const [otpEmail, setOtpEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.login({ email, password });
      if (response.token) {
        tokenStorage.setToken(response.token);
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!otpEmail) {
      setError("Email is required");
      return;
    }

    try {
      setOtpLoading(true);
      await authApi.requestOtp({ email: otpEmail });
      setOtpSent(true);
      setSuccess("OTP sent to your email!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!otp) {
      setError("OTP is required");
      return;
    }

    try {
      setLoading(true);
      // Note: Backend doesn't have OTP login endpoint, would need to be implemented
      // For now, we'll show an error
      setError("OTP login not yet implemented on backend");
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="card-fintech !p-8">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold font-display text-foreground">Welcome Back</h1>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <div className="flex rounded-xl bg-muted p-1 mb-6">
              <button
                onClick={() => {
                  setMethod("email");
                  setError(null);
                  setSuccess(null);
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${method === "email" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                Email
              </button>
              <button
                onClick={() => {
                  setMethod("otp");
                  setError(null);
                  setSuccess(null);
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${method === "otp" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                OTP
              </button>
            </div>

            {method === "email" ? (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="you@example.com"
                      className="pl-10 rounded-xl"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <Label>Password</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 rounded-xl"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-xl h-11 font-semibold"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                {!otpSent ? (
                  <form onSubmit={handleOtpRequest} className="space-y-4">
                    <div>
                      <Label>Email</Label>
                      <div className="relative mt-1.5">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="you@example.com"
                          className="pl-10 rounded-xl"
                          type="email"
                          value={otpEmail}
                          onChange={(e) => setOtpEmail(e.target.value)}
                          disabled={otpLoading}
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full rounded-xl h-11 font-semibold"
                      disabled={otpLoading}
                    >
                      {otpLoading ? "Sending..." : "Send OTP"}
                      {!otpLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleOtpLogin} className="space-y-4">
                    <div>
                      <Label>Enter OTP</Label>
                      <div className="relative mt-1.5">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="000000"
                          className="pl-10 rounded-xl"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full rounded-xl h-11 font-semibold"
                      disabled={loading}
                    >
                      {loading ? "Verifying..." : "Login with OTP"}
                      {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp("");
                        setOtpEmail("");
                      }}
                      className="text-xs text-primary hover:underline w-full text-center"
                    >
                      Back to email entry
                    </button>
                  </form>
                )}
              </div>
            )}

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary font-medium hover:underline">Register</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
