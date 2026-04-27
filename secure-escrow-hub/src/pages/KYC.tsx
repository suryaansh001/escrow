import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Upload, Phone, Shield, CheckCircle, AlertCircle, FileText, CreditCard, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/layout/Navbar";

const KYC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [aadharNumber, setAadharNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");

  // File uploads
  const [aadharFront, setAadharFront] = useState<File | null>(null);
  const [aadharBack, setAadharBack] = useState<File | null>(null);
  const [panCard, setPanCard] = useState<File | null>(null);

  const [otpSent, setOtpSent] = useState(false);

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, setter: (file: File | null) => void) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please upload only image files");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should not exceed 5MB");
        return;
      }
      setter(file);
      setError(null);
    }
  };

  const validateStep1 = () => {
    if (!aadharNumber || aadharNumber.length !== 12 || !/^\d{12}$/.test(aadharNumber)) {
      setError("Please enter a valid 12-digit Aadhar number");
      return false;
    }
    if (!panNumber || panNumber.length !== 10 || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.toUpperCase())) {
      setError("Please enter a valid PAN number (e.g., ABCDE1234F)");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!aadharFront || !aadharBack || !panCard) {
      setError("Please upload all required documents");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!mobileNumber || mobileNumber.length !== 10 || !/^\d{10}$/.test(mobileNumber)) {
      setError("Please enter a valid 10-digit mobile number");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError(null);
    setSuccess(null);

    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleSendOTP = async () => {
    if (!validateStep3()) return;

    setLoading(true);
    setError(null);

    // Simulate API call
    setTimeout(() => {
      setOtpSent(true);
      setSuccess("OTP sent to your mobile number");
      setLoading(false);
    }, 1000);
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    // For simulation, accept 111111 as valid OTP
    if (otp === "111111") {
      setLoading(true);
      setError(null);

      // Simulate verification
      setTimeout(() => {
        setSuccess("KYC verification completed successfully!");
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
        setLoading(false);
      }, 1000);
    } else {
      setError("Invalid OTP. For simulation, use 111111");
    }
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <CreditCard className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Enter Your Details</h2>
        <p className="text-gray-600 mt-2">Please provide your Aadhar and PAN card details</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="aadhar" className="text-sm font-medium">Aadhar Card Number</Label>
          <Input
            id="aadhar"
            type="text"
            placeholder="Enter 12-digit Aadhar number"
            value={aadharNumber}
            onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
            className="mt-1"
            maxLength={12}
          />
        </div>

        <div>
          <Label htmlFor="pan" className="text-sm font-medium">PAN Card Number</Label>
          <Input
            id="pan"
            type="text"
            placeholder="Enter PAN number (e.g., ABCDE1234F)"
            value={panNumber}
            onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
            className="mt-1"
            maxLength={10}
          />
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Camera className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Upload Documents</h2>
        <p className="text-gray-600 mt-2">Please upload clear images of your documents</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Aadhar Card Front
            </CardTitle>
            <CardDescription>Upload the front side of your Aadhar card</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, setAadharFront)}
                className="hidden"
                id="aadhar-front"
              />
              <label htmlFor="aadhar-front" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {aadharFront ? aadharFront.name : "Click to upload Aadhar front"}
                </p>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Aadhar Card Back
            </CardTitle>
            <CardDescription>Upload the back side of your Aadhar card</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, setAadharBack)}
                className="hidden"
                id="aadhar-back"
              />
              <label htmlFor="aadhar-back" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {aadharBack ? aadharBack.name : "Click to upload Aadhar back"}
                </p>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              PAN Card
            </CardTitle>
            <CardDescription>Upload your PAN card image</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, setPanCard)}
                className="hidden"
                id="pan-card"
              />
              <label htmlFor="pan-card" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {panCard ? panCard.name : "Click to upload PAN card"}
                </p>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Phone className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Verify Mobile Number</h2>
        <p className="text-gray-600 mt-2">Enter your mobile number to receive OTP</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="mobile" className="text-sm font-medium">Mobile Number</Label>
          <Input
            id="mobile"
            type="tel"
            placeholder="Enter 10-digit mobile number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
            className="mt-1"
            maxLength={10}
          />
        </div>

        {!otpSent ? (
          <Button
            onClick={handleSendOTP}
            disabled={loading || !mobileNumber}
            className="w-full"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </Button>
        ) : (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Enter 6-digit OTP</Label>
              <div className="mt-2 flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                For simulation, use OTP: 111111
              </p>
            </div>

            <Button
              onClick={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              className="w-full"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-semibold text-blue-600">DigiLocker KYC</span>
              </div>
              <CardTitle className="text-2xl">Complete Your KYC Verification</CardTitle>
              <CardDescription>
                Secure and government-compliant identity verification
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Step {currentStep} of {totalSteps}</span>
                  <span>{Math.round(progress)}% Complete</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Error/Success Messages */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              {/* Step Content */}
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    disabled={loading}
                  >
                    Previous
                  </Button>
                )}

                {currentStep < 3 && (
                  <Button
                    onClick={handleNext}
                    className="ml-auto"
                    disabled={loading}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KYC;