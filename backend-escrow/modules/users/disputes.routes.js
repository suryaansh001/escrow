import express from 'express';
import { createDispute, getDisputeById, getDisputesByUserId, resolveDispute } from './disputes.controller.js';
import { authMiddleware } from '../auth/auth.middleware.js';

const router = express.Router();

// Create new dispute
router.post('/create', authMiddleware, createDispute);

// Get dispute by ID
router.get('/:id', authMiddleware, getDisputeById);

// Get all disputes for the current user
router.get('/', authMiddleware, getDisputesByUserId);

// Resolve dispute
router.patch('/:id/resolve', authMiddleware, resolveDispute);

export default router;
