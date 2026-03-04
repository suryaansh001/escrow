import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Lock, Shield, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/layout/Navbar";

const Login = () => {
  const [method, setMethod] = useState<"email" | "otp">("email");

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

            <div className="flex rounded-xl bg-muted p-1 mb-6">
              <button
                onClick={() => setMethod("email")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${method === "email" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                Email
              </button>
              <button
                onClick={() => setMethod("otp")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${method === "otp" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                OTP
              </button>
            </div>

            {method === "email" ? (
              <div className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="you@example.com" className="pl-10 rounded-xl" />
                  </div>
                </div>
                <div>
                  <Label>Password</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="password" placeholder="••••••••" className="pl-10 rounded-xl" />
                  </div>
                </div>
                <div className="text-right">
                  <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Phone Number</Label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="+91 98765 43210" className="pl-10 rounded-xl" />
                  </div>
                </div>
              </div>
            )}

            <Button className="w-full mt-6 rounded-xl h-11 font-semibold" asChild>
              <Link to="/dashboard">
                {method === "email" ? "Login" : "Send OTP"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

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
