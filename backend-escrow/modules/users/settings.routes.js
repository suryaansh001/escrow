import express from 'express';
import { updateuserProfile, verifyEmailChange, setSecurityPin, verifySecurityPin, updateSecurityPin, verifyKyc } from './settings.controllers.js';
import { authMiddleware } from '../auth/auth.middleware.js';

const router = express.Router();

// Protected routes - require authentication
router.use(authMiddleware);

// Update user profile (email and phone number only)
router.put('/profile', updateuserProfile);

// Verify email change with OTP
router.post('/verify-email', verifyEmailChange);

// Security PIN management
router.post('/security-pin', setSecurityPin);
router.post('/security-pin/verify', verifySecurityPin);
router.put('/security-pin', updateSecurityPin);

// KYC verification (simulated — marks user as verified, sets base reliability score)
router.post('/kyc-verify', verifyKyc);

export default router;
