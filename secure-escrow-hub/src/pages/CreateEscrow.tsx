import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Upload, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";

const steps = ["Basic Info", "Risk Settings", "Confirm & Pay"];

const CreateEscrow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [adaptiveRisk, setAdaptiveRisk] = useState(true);
  const [milestones, setMilestones] = useState(false);

  const next = () => setCurrentStep((s) => Math.min(s + 1, 2));
  const prev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-display text-foreground">Create Escrow</h1>
          <p className="text-muted-foreground text-sm mt-1">Set up a new secure transaction</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-colors ${
                i < currentStep ? "bg-accent text-accent-foreground" : i === currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:inline ${i === currentStep ? "text-foreground" : "text-muted-foreground"}`}>
                {step}
              </span>
              {i < steps.length - 1 && <div className={`flex-1 h-px ${i < currentStep ? "bg-accent" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {currentStep === 0 && (
              <div className="card-fintech space-y-5">
                <div>
                  <Label>Transaction Title</Label>
                  <Input placeholder="e.g. Website Development Project" className="mt-1.5 rounded-xl" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea placeholder="Describe the agreement terms..." className="mt-1.5 rounded-xl min-h-[100px]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Amount (₹)</Label>
                    <Input type="number" placeholder="25000" className="mt-1.5 rounded-xl" />
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Select defaultValue="inr">
                      <SelectTrigger className="mt-1.5 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inr">INR (₹)</SelectItem>
                        <SelectItem value="usd">USD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Counterparty Email / Phone</Label>
                  <Input placeholder="seller@example.com" className="mt-1.5 rounded-xl" />
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="card-fintech space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Adaptive Risk Engine</p>
                      <p className="text-xs text-muted-foreground">Automatically assess transaction risk</p>
                    </div>
                  </div>
                  <Switch checked={adaptiveRisk} onCheckedChange={setAdaptiveRisk} />
                </div>

                <div>
                  <Label>Transaction Type</Label>
                  <Select defaultValue="service">
                    <SelectTrigger className="mt-1.5 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Physical Product</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="digital">Digital Good</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Upload Agreement (optional)</Label>
                  <div className="mt-1.5 border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Milestone-based Release</p>
                      <p className="text-xs text-muted-foreground">Release funds in stages</p>
                    </div>
                  </div>
                  <Switch checked={milestones} onCheckedChange={setMilestones} />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="card-fintech space-y-6">
                <div>
                  <h3 className="text-base font-semibold font-display text-foreground mb-4">Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Transaction Amount</span>
                      <span className="font-semibold text-foreground">₹25,000</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Escrow Fee (1.5%)</span>
                      <span className="font-semibold text-foreground">₹375</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Risk Score</span>
                      <span className="status-badge risk-badge-low">Low</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="font-bold text-foreground text-lg">₹25,375</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full rounded-xl h-12 text-base font-semibold">
                  <Shield className="mr-2 h-4 w-4" />
                  Confirm & Fund Escrow
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={prev} disabled={currentStep === 0} className="rounded-xl">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          {currentStep < 2 && (
            <Button onClick={next} className="rounded-xl">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateEscrow;
