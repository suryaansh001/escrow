import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, AlertTriangle, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { RiskIndicator } from "@/components/common/RiskIndicator";
import { useAdaptiveEscrow } from "@/context/AdaptiveEscrowContext";
import { dashboardApi, securityApi } from "@/lib/api";
import { createEscrowOnChain } from "@/lib/web3Escrow";

interface CreateEscrowForm {
  amount: string;
  counterpartyId: string;
  sellerWalletAddress: string;
  terms: string;
  pin: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  reliability_score?: number;
  kyc_status?: string;
}

const CreateTransaction = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'review' | 'confirmation'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const { createTransaction } = useAdaptiveEscrow();
  const [form, setForm] = useState<CreateEscrowForm>({
    amount: '',
    counterpartyId: '',
    sellerWalletAddress: '',
    terms: '',
    pin: '',
  });

  const [riskPreview, setRiskPreview] = useState({
    level: 'low' as const,
    score: 0.1,
    riskScoreNumeric: 0.1,
    factors: [] as string[],
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true);
        const res = await dashboardApi.listUsers();
        if (res.success) {
          setUsers(res.users || []);
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Failed to load counterparties. Please refresh or re-login.');
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const calculateRiskScore = (amount: string, counterpartyId: string) => {
    const numAmount = parseFloat(amount);
    let amountRisk = 0;
    let factors: string[] = [];

    // Amount-based risk (0-0.6 contribution)
    if (numAmount > 100000) {
      amountRisk = 0.5;
      factors.push('Large transaction amount (>₹100k)');
    } else if (numAmount > 50000) {
      amountRisk = 0.3;
      factors.push('Moderate transaction size (₹50k-100k)');
    } else if (numAmount > 0) {
      amountRisk = 0.1;
    }

    // Counterparty-based risk (0-0.4 contribution)
    let counterpartyRisk = 0;
    const selectedUser = users.find(user => user.id === counterpartyId);
    
    if (selectedUser) {
      // Convert reliability_score (0-100) to risk (0-1)
      // High reliability (100) = low risk (0), Low reliability (0) = high risk (1)
      const reliabilityScore = selectedUser.reliability_score || 50;
      counterpartyRisk = (100 - reliabilityScore) / 100;
      
      if (reliabilityScore < 40) {
        factors.push(`Counterparty low reliability (${(reliabilityScore/100).toFixed(4)}/1)`);
      } else if (reliabilityScore < 70) {
        factors.push(`Counterparty moderate reliability (${(reliabilityScore/100).toFixed(4)}/1)`);
      }
    }

    // Combined risk score (0-1 scale, where 1 = high risk, 0 = low risk)
    const finalScore = Math.min(1, amountRisk * 0.6 + counterpartyRisk * 0.4);
    
    // Map to risk level
    let level: 'low' | 'medium' | 'high' = 'low';
    if (finalScore > 0.75) {
      level = 'high';
    } else if (finalScore > 0.4) {
      level = 'medium';
    }

    return {
      level,
      score: Math.round(finalScore * 100),
      riskScoreNumeric: finalScore,
      factors,
    };
  };

  const handleInputChange = (field: keyof CreateEscrowForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));

    // Update risk preview whenever amount or counterpartyId changes
    if (field === 'amount' || field === 'counterpartyId') {
      const newAmount = field === 'amount' ? value : form.amount;
      const newCounterpartyId = field === 'counterpartyId' ? value : form.counterpartyId;
      const newRisk = calculateRiskScore(newAmount, newCounterpartyId);
      setRiskPreview(newRisk);
    }
  };

  const handleCreateTransaction = async () => {
    if (!form.amount || !form.counterpartyId || !form.sellerWalletAddress || !form.terms || !form.pin) {
      setError('Please fill in all required fields including seller wallet and PIN');
      return;
    }

    if (form.pin.length !== 6 || !/^\d{6}$/.test(form.pin)) {
      setError('PIN must be exactly 6 digits');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First verify PIN
      await securityApi.verifyPin(form.pin);

      const selectedUser = users.find(user => user.id === form.counterpartyId);
      if (!selectedUser) {
        setError('Selected counterparty not found');
        setLoading(false);
        return;
      }

      const onchain = await createEscrowOnChain({
        sellerAddress: form.sellerWalletAddress,
        amountInInr: parseFloat(form.amount),
        terms: form.terms,
      });

      await createTransaction({
        amount: parseFloat(form.amount),
        counterparty: selectedUser.full_name || selectedUser.email,
        terms: form.terms,
        tx_hash_create: onchain.txHash,
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
                    <p className="font-medium text-foreground">
                      {(() => {
                        const u = users.find(user => user.id === form.counterpartyId);
                        return u ? (u.full_name || u.email) : 'Unknown';
                      })()}
                    </p>
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
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">Risk Score</span>
                  <span className={`text-2xl font-bold ${
                    riskPreview.riskScoreNumeric > 0.75 ? 'text-destructive' :
                    riskPreview.riskScoreNumeric > 0.4 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {(riskPreview.riskScoreNumeric).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">Risk Score Range: 0 (Low Risk) to 1 (High Risk)</p>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      riskPreview.riskScoreNumeric > 0.75 ? 'bg-destructive' :
                      riskPreview.riskScoreNumeric > 0.4 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${riskPreview.riskScoreNumeric * 100}%` }}
                  />
                </div>
              </div>
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
            <label className="text-sm font-medium text-foreground block mb-2">Counterparty *</label>
            <Select value={form.counterpartyId} onValueChange={(value) => handleInputChange('counterpartyId', value)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder={usersLoading ? "Loading users..." : "Select a counterparty"} />
              </SelectTrigger>
              <SelectContent>
                {users.length === 0 && !usersLoading && (
                  <SelectItem value="__none__" disabled>No counterparties found</SelectItem>
                )}
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name ? `${user.full_name} (${user.email})` : user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {usersLoading && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Loader className="h-3 w-3 animate-spin" />
                Loading users...
              </div>
            )}
            {form.counterpartyId && (
              <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-2">Counterparty Risk Profile</p>
                {(() => {
                  const selectedUser = users.find(user => user.id === form.counterpartyId);
                  if (selectedUser) {
                    const riskScore = selectedUser.reliability_score || 0;
                    const riskLevel = riskScore > 70 ? 'low' : riskScore > 40 ? 'medium' : 'high';
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Risk Score:</span>
                          <span className="text-sm font-medium">{(riskScore/100).toFixed(4)}/1</span>
                        </div>
                        <RiskIndicator
                          level={riskLevel as 'low' | 'medium' | 'high'}
                          score={riskScore}
                          reason={`Based on ${selectedUser.full_name}'s transaction history`}
                          showTooltip={false}
                        />
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
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
            <label className="text-sm font-medium text-foreground block mb-2">Seller Wallet Address *</label>
            <Input
              placeholder="0x..."
              value={form.sellerWalletAddress}
              onChange={(e) => handleInputChange('sellerWalletAddress', e.target.value)}
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground mt-1">Required for on-chain escrow creation via MetaMask</p>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Security PIN (6 digits) *</label>
            <Input
              type="password"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="Enter your 6-digit PIN"
              value={form.pin}
              onChange={(e) => handleInputChange('pin', e.target.value)}
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground mt-1">Required for transaction authorization</p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Risk Assessment</p>
            <div className="card-fintech p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground font-medium">Risk Score</span>
                <span className={`text-lg font-bold ${
                  riskPreview.riskScoreNumeric > 0.75 ? 'text-destructive' :
                  riskPreview.riskScoreNumeric > 0.4 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {(riskPreview.riskScoreNumeric).toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    riskPreview.riskScoreNumeric > 0.75 ? 'bg-destructive' :
                    riskPreview.riskScoreNumeric > 0.4 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${riskPreview.riskScoreNumeric * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Range: 0 (Low) to 1 (High)</p>
              <RiskIndicator
                level={riskPreview.level}
                score={riskPreview.score}
                reason={riskPreview.factors.length > 0 ? riskPreview.factors[0] : 'Standard transaction'}
                showTooltip={false}
              />
            </div>
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
