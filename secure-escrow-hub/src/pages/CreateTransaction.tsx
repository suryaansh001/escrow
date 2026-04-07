import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { RiskIndicator } from "@/components/common/RiskIndicator";
import { useAdaptiveEscrow } from "@/context/AdaptiveEscrowContext";

interface CreateEscrowForm {
  amount: string;
  counterparty: string;
  terms: string;
}

const CreateTransaction = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'review' | 'confirmation'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createTransaction } = useAdaptiveEscrow();
  const [form, setForm] = useState<CreateEscrowForm>({
    amount: '',
    counterparty: '',
    terms: '',
  });

  const [riskPreview, setRiskPreview] = useState({
    level: 'low' as const,
    score: 15,
    factors: [] as string[],
  });

  const handleInputChange = (field: keyof CreateEscrowForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));

    if (field === 'amount') {
      const numAmount = parseFloat(value);
      if (numAmount > 100000) {
        setRiskPreview(prev => ({
          ...prev,
          level: 'high',
          score: 85,
          factors: ['Large transaction amount', 'Exceeds typical range'],
        }));
      } else if (numAmount > 50000) {
        setRiskPreview(prev => ({
          ...prev,
          level: 'medium',
          score: 45,
          factors: ['Moderate transaction size'],
        }));
      } else {
        setRiskPreview(prev => ({
          ...prev,
          level: 'low',
          score: 15,
          factors: [],
        }));
      }
    }
  };

  const handleCreateTransaction = async () => {
    if (!form.amount || !form.counterparty || !form.terms) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      createTransaction({
        amount: parseFloat(form.amount),
        counterparty: form.counterparty,
        terms: form.terms,
      });

      setStep('confirmation');
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
      setLoading(false);
    }
  };

  if (step === 'confirmation') {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto mt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-fintech text-center"
          >
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Transaction Created!</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Your escrow transaction has been created. The counterparty will receive an invitation.
            </p>
            <p className="text-xs text-muted-foreground">Redirecting to dashboard...</p>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  if (step === 'review') {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Button variant="ghost" size="sm" onClick={() => setStep('form')} className="rounded-xl">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold font-display">Confirm Transaction</h1>
          </div>

          <div className="space-y-6">
            {/* Risk Warning */}
            {riskPreview.level !== 'low' && (
              <Alert className={riskPreview.level === 'high' ? 'bg-destructive/10 border-destructive/20' : 'bg-yellow-500/10 border-yellow-600/20'}>
                <AlertTriangle className={`h-4 w-4 ${riskPreview.level === 'high' ? 'text-destructive' : 'text-yellow-600'}`} />
                <AlertDescription className={riskPreview.level === 'high' ? 'text-destructive' : 'text-yellow-600'}>
                  This transaction has elevated risk. Please review before confirming.
                </AlertDescription>
              </Alert>
            )}

            {/* Transaction Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-fintech"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Transaction Details</h3>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Amount</p>
                    <p className="text-2xl font-bold text-foreground">₹{parseFloat(form.amount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Counterparty</p>
                    <p className="font-medium text-foreground">{form.counterparty}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Terms & Conditions</p>
                  <p className="text-foreground">{form.terms}</p>
                </div>
              </div>
            </motion.div>

            {/* Risk Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-fintech"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Risk Assessment</h3>
              <div className="mb-4">
                <RiskIndicator
                  level={riskPreview.level}
                  score={riskPreview.score}
                  reason={riskPreview.factors.length > 0 ? riskPreview.factors[0] : 'Standard transaction'}
                  details={riskPreview.factors.join(', ')}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {riskPreview.level === 'low' && 'This transaction meets standard safety criteria.'}
                {riskPreview.level === 'medium' && 'Review the risk factors before proceeding.'}
                {riskPreview.level === 'high' && 'High-risk transactions require additional verification.'}
              </p>
            </motion.div>

            {error && (
              <Alert className="bg-destructive/10 border-destructive/20">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 pt-6">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setStep('form')}>
                Back
              </Button>
              <Button
                className="flex-1 rounded-xl"
                onClick={handleCreateTransaction}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Transaction'}
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-display text-foreground">Create Escrow Transaction</h1>
          <p className="text-muted-foreground text-sm mt-1">Set up a new secure transaction with real-time risk assessment</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-fintech space-y-6"
        >
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Amount (₹) *</label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={form.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Counterparty Name *</label>
            <Input
              type="text"
              placeholder="Enter counterparty name"
              value={form.counterparty}
              onChange={(e) => handleInputChange('counterparty', e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Terms & Conditions *</label>
            <Textarea
              placeholder="Specify any specific terms or conditions"
              value={form.terms}
              onChange={(e) => handleInputChange('terms', e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Risk Preview</p>
            <RiskIndicator
              level={riskPreview.level}
              score={riskPreview.score}
              reason={riskPreview.factors.length > 0 ? riskPreview.factors[0] : undefined}
              showTooltip={false}
            />
          </div>

          <div className="flex gap-3 pt-6 border-t border-border">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button className="flex-1 rounded-xl" onClick={() => setStep('review')}>
              Review & Continue
            </Button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default CreateTransaction;
