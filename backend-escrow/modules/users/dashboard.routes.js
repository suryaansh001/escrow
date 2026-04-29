import express from 'express';
import { getDashboardData, getUserProfile, listUsers, getDecayPreview } from './dashboard.controller.js';
import { authMiddleware } from '../auth/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, getDashboardData);
router.get('/profile', authMiddleware, getUserProfile);
router.get('/users', authMiddleware, listUsers);
router.get('/decay-preview', authMiddleware, getDecayPreview);

export default router;
