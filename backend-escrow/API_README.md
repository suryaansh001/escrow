# API Routes Documentation

This document lists all the API routes available in the Escrow Backend application, along with their associated controller functions.

## Base URL
All routes are prefixed with the server URL (e.g., `http://localhost:3000` or production URL).

## Authentication
Most routes require authentication via JWT token in the Authorization header. Routes marked with (auth) require authentication.

## Routes by Module

### Authentication Routes (`/auth`)
- `POST /auth/register` → `register` - Register a new user
- `POST /auth/login` → `login` - User login
- `POST /auth/otp` → `otpgeneration` - Generate OTP for authentication

### Dashboard Routes (`/dashboard`) - All require authentication
- `GET /dashboard/` → `getDashboardData` - Get dashboard data for the authenticated user
- `GET /dashboard/profile` → `getUserProfile` - Get user profile information
- `GET /dashboard/users` → `listUsers` - List all users (admin functionality)

### Settings Routes (`/settings`) - All require authentication
- `PUT /settings/profile` → `updateuserProfile` - Update user profile (email and phone)
- `POST /settings/verify-email` → `verifyEmailChange` - Verify email change with OTP
- `POST /settings/security-pin` → `setSecurityPin` - Set security PIN

- `POST /settings/security-pin/verify` → `verifySecurityPin` - Verify security PIN
- `PUT /settings/security-pin` → `updateSecurityPin` - Update security PIN

### Escrow Routes (`/escrow`) - All require authentication
- `POST /escrow/create` → `createEscrow` - Create a new escrow
- `GET /escrow/:id` → `getEscrowById` - Get escrow by ID
- `GET /escrow/` → `getEscrowsByUserId` - Get all escrows for the current user
- `PATCH /escrow/:id/state` → `updateEscrowState` - Update escrow state
- `POST /escrow/:id/fund` → `fundEscrow` - Fund escrow from wallet
- `POST /escrow/sync/run` → `runEscrowSyncOnce` - Trigger one-time sync reconciliation

### Disputes Routes (`/disputes`) - All require authentication
- `POST /disputes/create` → `createDispute` - Create a new dispute
- `GET /disputes/:id` → `getDisputeById` - Get dispute by ID
- `GET /disputes/` → `getDisputesByUserId` - Get all disputes for the current user
- `PATCH /disputes/:id/resolve` → `resolveDispute` - Resolve a dispute

### Risk Routes (`/risk`) - All require authentication
- `POST /risk/compute` → `computeRisk` - Compute risk assessment

### Wallet Routes (`/wallet`) - All require authentication
- `GET /wallet/:userId/balance` → `getBalance` - Get user wallet balance
- `GET /wallet/:userId/transactions` → `getTransactionHistory` - Get user transaction history
- `POST /wallet/:userId/deposit` → `deposit` - Deposit funds to wallet
- `POST /wallet/:userId/withdraw` → `withdraw` - Withdraw funds from wallet
- `POST /wallet/:fromUserId/transfer` → `transfer` - Transfer funds between users
- `POST /wallet/:userId/fund-escrow` → `fundEscrow` - Fund escrow from wallet

### Health Check
- `GET /healthz` → Health check endpoint - Returns server and database status

## Notes
- All routes under modules except `/auth` require authentication middleware.
- Parameters in routes (e.g., `:id`, `:userId`) are path parameters.
- Request bodies and responses vary by endpoint; refer to controller implementations for details.
- Error handling is implemented in controllers and middleware.