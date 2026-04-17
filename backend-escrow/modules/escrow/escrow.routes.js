import express from 'express';
import { createEscrow, getEscrowById, getEscrowsByUserId, updateEscrowState, fundEscrow } from './escrow.controller.js';
import { authMiddleware } from '../auth/auth.middleware.js';

const router = express.Router();

// Create new escrow
router.post('/create', authMiddleware, createEscrow);

// Get escrow by ID
router.get('/:id', authMiddleware, getEscrowById);

// Get all escrows for the current user
router.get('/', authMiddleware, getEscrowsByUserId);

// Update escrow state
router.patch('/:id/state', authMiddleware, updateEscrowState);

// Fund escrow from wallet
router.post('/:id/fund', authMiddleware, fundEscrow);

export default router;
