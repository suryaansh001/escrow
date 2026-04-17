import express from 'express';
import walletController from './wallet.controller.js';
import { authMiddleware } from '../auth/auth.middleware.js';

const router = express.Router();

// All wallet routes require authentication
router.use(authMiddleware);

/**
 * @route GET /api/wallet/:userId/balance
 * @desc Get user wallet balance
 * @access Private
 */
router.get('/:userId/balance', walletController.getBalance);

/**
 * @route GET /api/wallet/:userId/transactions
 * @desc Get user transaction history
 * @access Private
 */
router.get('/:userId/transactions', walletController.getTransactionHistory);

/**
 * @route POST /api/wallet/:userId/deposit
 * @desc Deposit funds to wallet
 * @access Private
 * @body { amount: number, description?: string }
 */
router.post('/:userId/deposit', walletController.deposit);

/**
 * @route POST /api/wallet/:userId/withdraw
 * @desc Withdraw funds from wallet
 * @access Private
 * @body { amount: number, description?: string }
 */
router.post('/:userId/withdraw', walletController.withdraw);

/**
 * @route POST /api/wallet/:fromUserId/transfer
 * @desc Transfer funds between users
 * @access Private
 * @body { toUserId: string, amount: number, description?: string }
 */
router.post('/:fromUserId/transfer', walletController.transfer);

/**
 * @route POST /api/wallet/:userId/fund-escrow
 * @desc Fund escrow from wallet
 * @access Private
 * @body { escrowId: string, amount: number }
 */
router.post('/:userId/fund-escrow', walletController.fundEscrow);

export default router;