//This file focuses on assembling your application.
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { sql } from './config/db.js';
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
  'https://sea-escrow.vercel.app',
  'https://escrow-beta.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/settings', settingsRoutes);
app.use('/escrow', escrowRoutes);
app.use('/disputes', disputeRoutes);
app.use('/risk', riskRoutes);
app.use('/wallet', walletRoutes);

app.get("/healthz", async (req, res) => {
    try {
      // Test database connection
      const dbTest = await sql`SELECT 1 as test`;
      res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        database: dbTest.length > 0 ? "connected" : "disconnected"
      });
    } catch (error) {
      console.error('Health check failed:', error);
      res.status(500).json({
        status: "error",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error.message
      });
    }
});

export default app;