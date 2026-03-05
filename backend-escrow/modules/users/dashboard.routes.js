import express from 'express';
import { getDashboardData } from './dashboard.controller.js';
import { authMiddleware } from '../auth/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, getDashboardData);

export default router;
