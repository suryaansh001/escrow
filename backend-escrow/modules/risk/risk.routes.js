import express from 'express';
import { computeRisk } from './risk.controller.js';
import { authMiddleware } from '../auth/auth.middleware.js';

const router = express.Router();

// POST /api/risk/compute
router.post('/compute', authMiddleware, computeRisk);

export default router;