import express from 'express';
import { getDashboardData, getUserProfile, listUsers } from './dashboard.controller.js';
import { authMiddleware } from '../auth/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, getDashboardData);
router.get('/profile', authMiddleware, getUserProfile);
router.get('/users', authMiddleware, listUsers);

export default router;
