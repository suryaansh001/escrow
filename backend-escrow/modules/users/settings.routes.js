import express from 'express';
import { updateuserProfile, verifyEmailChange } from './settings.controllers.js';
import { authMiddleware } from '../auth/auth.middleware.js';

const router = express.Router();

// Protected routes - require authentication
router.use(authMiddleware);

// Update user profile (email and phone number only)
router.put('/profile', updateuserProfile);

// Verify email change with OTP
router.post('/verify-email', verifyEmailChange);

export default router;
