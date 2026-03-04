import express from 'express';
import { register, login, otpgeneration } from './auth.validator.js';

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/otp', otpgeneration);

export default router;
