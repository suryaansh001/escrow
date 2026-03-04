import express from 'express';
import { getDashboardData } from './dashboard.controller.js';

const router = express.Router();

router.get('/', getDashboardData);

export default router;
