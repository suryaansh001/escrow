//This file focuses on assembling your application.
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from '../modules/auth/auth.routes.js';
import dashboardRoutes from '../modules/users/dashboard.routes.js';
import settingsRoutes from '../modules/users/settings.routes.js';
import disputeRoutes from '../modules/users/disputes.routes.js';
import escrowRoutes from '../modules/escrow/escrow.routes.js';
import riskRoutes from '../modules/risk/risk.routes.js';
import walletRoutes from '../modules/users/wallet.routes.js';
import { authMiddleware } from '../modules/auth/auth.middleware.js';

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/settings', settingsRoutes);
app.use('/escrow', escrowRoutes);
app.use('/disputes', disputeRoutes);
app.use('/risk', riskRoutes);
app.use('/wallet', walletRoutes);

app.get("/healthz", (req, res) => {
    res.status(200).json({ status: "ok" });
});

export default app;