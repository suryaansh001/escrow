# Adaptive Risk-Based Escrow System
## Complete Project Documentation

---

## SLIDE 1: PROBLEM STATEMENT

### The Problem
Traditional escrow systems apply **static, one-size-fits-all rules** to all transactions, regardless of risk factors. This creates two critical issues:

1. **Over-Protection of Low-Risk Transactions**
   - Safe transactions between established users are locked for unnecessarily long periods
   - Seller liquidity is unnecessarily constrained
   - User experience suffers due to inflexible fund release windows

2. **Under-Protection of High-Risk Transactions**
   - New sellers with no reputation history get the same protections as verified users
   - Transactions with unusual patterns (large amounts, behavioral anomalies) aren't flagged
   - Fraud risk is not quantified or made transparent to users

### Key Challenges Addressed
- **Fraud Detection**: How to identify risky transactions without false positives?
- **Transparency**: How to make risk scoring explainable to users?
- **Blockchain Integration**: How to perform off-chain intelligence while maintaining on-chain immutability?
- **Mathematical Rigor**: How to quantify fraud risk using sound statistical models?
- **User Experience**: How to balance protection with liquidity?

### Solution Objective
Build a **mathematically rigorous, adaptive escrow system** that:
- Dynamically adjusts escrow lock duration based on quantified risk
- Implements staged fund release to balance buyer protection and seller liquidity
- Makes risk transparent through explainable scoring
- Runs on blockchain with off-chain computation and on-chain validation

---

## SLIDE 2: APPROACH & ARCHITECTURE

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER TIER (Frontend)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React/TypeScript Web App (Vite)                     │   │
│  │  - Wallet Connection (MetaMask, Ethers.js)          │   │
│  │  - Transaction Creation Flow                         │   │
│  │  - Risk Score Visualization                          │   │
│  │  - Escrow Timeline & Status Tracking                 │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API (JSON)
┌────────────────────────▼────────────────────────────────────┐
│                   APPLICATION TIER                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express.js Backend + Risk Computation Engine        │   │
│  │  ├─ Auth Module: OTP/JWT/Security PIN               │   │
│  │  ├─ Escrow Module: Creation/State Management        │   │
│  │  ├─ Risk Module: Multi-Factor Statistical Scoring   │   │
│  │  ├─ Wallet Module: Fund Management                  │   │
│  │  ├─ Disputes Module: Resolution & Arbitration       │   │
│  │  ├─ Sync Worker: Continuous Blockchain Monitoring   │   │
│  │  └─ PostgreSQL Database: Neon (Serverless)          │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ ethers.js / Contract Calls
┌────────────────────────▼────────────────────────────────────┐
│                    BLOCKCHAIN TIER                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Ethereum Smart Contract (Solidity)                  │   │
│  │  - Fund Custody & State Machine                      │   │
│  │  - Event Emission & Logging                          │   │
│  │  - Dispute Resolution Logic                          │   │
│  │  - Immutable Transaction Records                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Core Workflow: Transaction Creation to Fund Release

```
Step 1: User Initiates Escrow
   └─ Frontend: User selects seller, enters amount, approves wallet transaction
   
Step 2: Risk Computation (Off-Chain)
   └─ Backend: Calculates multi-factor risk score using:
      ├─ Rolling Score (Z-score anomaly detection)
      ├─ CUSUM Score (drift detection over time)
      └─ Surge Score (burst activity detection)
   
Step 3: Blockchain Escrow Creation
   └─ Smart Contract: Locks buyer funds in contract
      └─ Event: EscrowCreated emitted with escrow ID & terms
   
Step 4: Database Recording
   └─ Backend stores escrow, risk scores, and transaction metadata
   
Step 5: Risk-Based Lock Duration Applied
   └─ If risk_score ≤ 0.3: Standard escrow period (3-5 days)
      If 0.3 < risk_score ≤ 0.55: Monitoring period (5-7 days)
      If 0.55 < risk_score ≤ 0.75: Partial restriction (7-14 days)
      If risk_score > 0.75: Immediate freeze or block
   
Step 6: Seller Marks Delivery
   └─ Seller confirms delivery of goods/services
      └─ Event: EscrowDelivered emitted
   
Step 7: Buyer Releases Funds
   └─ After lock period, buyer confirms and releases funds
      └─ Event: EscrowReleased emitted
      └─ Funds transferred to seller wallet
   
Step 8: Reputation Update
   └─ Both parties' reliability scores updated based on transaction outcome
      └─ User reliability score adjusts for future transactions
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Off-Chain Risk Computation** | Saves gas on blockchain; risk calculation requires complex statistical operations |
| **Event-Driven Sync** | Backend monitors blockchain events every 20 seconds; ensures database stays in sync |
| **Multi-Factor Scoring** | Single metric is easy to game; combining 3 independent signals provides robustness |
| **Staged Release** | Balances buyer protection (funds locked initially) with seller liquidity (phased release) |
| **OTP-Based Auth** | Email verification prevents account takeover; JWT tokens manage session state |
| **PostgreSQL for History** | Infinite transaction history needed for statistical models; blockchain isn't efficient for analytics |

---

## SLIDE 3: FORMULAS & MATHEMATICAL MODELS

### 3.1 Risk Scoring Framework

The system implements a **Three-Factor Risk Model** that combines independent statistical signals:

#### Factor 1: Rolling Score (Weight: 40%)

**Purpose**: Detect anomalous individual transaction amounts relative to user's historical baseline.

**Formula**:
$$S_{rolling} = \min\left(1, \frac{|Z|}{6}\right)$$

Where:
- $Z = \frac{X - \mu}{\sigma}$ is the Z-score of current transaction amount
- $X$ = current transaction amount
- $\mu$ = mean of user's last 30-day transaction amounts
- $\sigma$ = standard deviation of user's last 30-day transaction amounts
- Max threshold: 6σ (beyond this, normalized to 1.0)

**Interpretation**:
- $S_{rolling} = 0.0$: Amount matches historical average; no anomaly
- $S_{rolling} = 0.5$: Amount is 3σ away from mean; moderate anomaly
- $S_{rolling} = 1.0$: Amount is 6σ+ away from mean; extreme anomaly

**Code Implementation**:
```javascript
function rollingScore(z) {
    return Math.min(1, Math.abs(z) / 6);
}

// Example: User who normally transacts $100±$20
// Current transaction: $200
// Z = (200 - 100) / 20 = 5
// S_rolling = 5 / 6 ≈ 0.83 (HIGH anomaly risk)
```

---

#### Factor 2: CUSUM Score (Weight: 35%)

**Purpose**: Detect gradual drift in user's transaction behavior (cumulative pattern changes over days/weeks).

**Algorithm**: Cumulative Sum Control Chart (CUSUM)

**Setup Parameters**:
- $k = 0.5 \times \sigma$ (decision interval; half of standard deviation)
- $h = 5 \times \sigma$ (threshold for alarm; 5 times standard deviation)
- $\mu$ = baseline mean of user's 90-day transactions
- $x_t$ = current transaction amount

**Update Equations**:
$$S^+_t = \max(0, S^+_{t-1} + (x_t - \mu - k))$$
$$S^-_t = \max(0, S^-_{t-1} + (\mu + k - x_t))$$

Where:
- $S^+_t$ = positive cumulative sum (detects upward drift)
- $S^-_t$ = negative cumulative sum (detects downward drift)

**CUSUM Score**:
$$S_{CUSUM} = \min\left(1, \frac{\max(S^+_t, S^-_t)}{h}\right)$$

**Interpretation**:
- $S_{CUSUM} = 0.0$: User behavior is stable and predictable
- $S_{CUSUM} = 0.5$: Moderate drift detected; behavior is changing gradually
- $S_{CUSUM} = 1.0$: Significant drift detected; user behavior has fundamentally changed

**State Persistence**:
CUSUM maintains state across transactions:
```javascript
// Stored in cusum_state table
{
  user_id: 123,
  s_pos: 450.5,      // Positive drift accumulation
  s_neg: 0,          // No negative drift
  updated_at: timestamp
}
```

**Fraud Detection Capability**: Catches escalating fraud patterns:
- Day 1: Scammer transacts $100 (normal)
- Day 2: Scammer transacts $150 (slightly above average)
- Day 3: Scammer transacts $200 (above average)
- Day 4: Scammer transacts $250 (above average)
- Cumulative drift = CUSUM triggers alert

---

#### Factor 3: Surge Score (Weight: 25%)

**Purpose**: Detect abnormal burst activity in 24-hour windows (sudden increase in transaction frequency).

**Formula**:
$$S_{Surge} = \min\left(1, \frac{\text{Surge}}{6}\right)$$

Where:
$$\text{Surge} = \frac{\text{Transactions in last 24 hours}}{\text{Average daily transactions (last 30 days)}}$$

**Interpretation**:
- $\text{Surge} = 1.0$: Normal daily activity
- $\text{Surge} = 3.0$: 3x normal activity (HIGH)
- $\text{Surge} = 6.0+$: Extremely abnormal burst

**Example Calculation**:
```
User statistics:
- Last 30 days: 60 transactions total
- Average per day: 60 / 30 = 2 transactions/day

Current 24 hours:
- Transactions created: 8

Surge = 8 / 2 = 4.0
S_Surge = min(1, 4.0 / 6) ≈ 0.67 (HIGH - unusual burst)
```

---

### 3.2 Final Risk Score Calculation

The three independent factors are combined using **weighted average**:

$$\text{Risk Score} = 0.4 \times S_{rolling} + 0.35 \times S_{CUSUM} + 0.25 \times S_{Surge}$$

**Range**: 0.0 (minimum risk) to 1.0 (maximum risk)

**Weighting Justification**:
- **40% Rolling**: Immediate transaction anomalies are strongest fraud signals
- **35% CUSUM**: Behavioral drift over time indicates account compromise or pattern escalation
- **25% Surge**: Burst activity is less reliable alone but adds important context

---

### 3.3 Risk Level Classification & Actions

Based on final risk score, the system triggers different escrow protections:

| Risk Score | Risk Level | Action | Escrow Duration | Additional Actions |
|------------|-----------|--------|-----------------|-------------------|
| 0.0 - 0.3 | **Normal** | Proceed | 3-5 days | Standard workflow |
| 0.3 - 0.55 | **Monitoring** | Caution | 5-7 days | Send risk notification; Monitor closely |
| 0.55 - 0.75 | **Partial Restriction** | High Alert | 7-14 days | Extended lock; Email warnings; Limited amount |
| > 0.75 | **Immediate Freeze** | Critical | Block/Max Lock | Transaction blocked; User flagged; Manual review required |

**Lock Duration Formula** (for approved transactions):
$$\text{Lock Days} = 3 + 11 \times \text{Risk Score}$$

- At risk_score = 0.3: 3 + 11(0.3) = 6.3 days
- At risk_score = 0.75: 3 + 11(0.75) = 11.25 days

---

### 3.4 Reliability Score Update

After each completed transaction, user's reliability score is updated to improve future risk assessments:

$$\text{Reliability Score}_{new} = \alpha \times \text{Reliability Score}_{old} + (1 - \alpha) \times \text{Transaction Outcome}$$

Where:
- $\alpha = 0.7$ (weight for historical score; exponential smoothing)
- $\text{Transaction Outcome}$ = 1.0 if successful, 0.0 if disputed, 0.5 if partially resolved
- Range: 0.0 (unreliable) to 1.0 (highly reliable)

**Effect on Risk**:
- Higher reliability score → Lower risk assessment in future
- Disputed transactions → Score decreases → Future transactions scrutinized more

---

### 3.5 Example Calculation Walkthrough

**Scenario**: User has history but current transaction looks suspicious

**User History**:
- Last 30 days avg: $500, std dev: $100
- Last 90 days avg: $450, std dev: $120
- Last 30 days: 8 transactions
- Last 24 hours: 3 transactions
- Reliability score: 0.85

**Current Transaction**: $850

**Step 1: Calculate Rolling Score**
```
Z = (850 - 500) / 100 = 3.5
S_rolling = min(1, 3.5 / 6) = 0.583
```

**Step 2: Calculate CUSUM Score**
```
Baseline (90-day): μ = 450, σ = 120
k = 0.5 × 120 = 60
h = 5 × 120 = 600
Previous CUSUM state: S_pos = 100, S_neg = 0

Current:
S_pos_new = max(0, 100 + (850 - 450 - 60)) = 100 + 340 = 440
S_CUSUM = min(1, 440 / 600) = 0.733
```

**Step 3: Calculate Surge Score**
```
Avg daily (30 days): 8 / 30 ≈ 0.27 per day
Transactions in last 24h: 3
Surge = 3 / 0.27 = 11.1
S_Surge = min(1, 11.1 / 6) = 1.0 (capped)
```

**Step 4: Final Score**
```
Risk Score = 0.4(0.583) + 0.35(0.733) + 0.25(1.0)
           = 0.233 + 0.257 + 0.25
           = 0.74
```

**Result**: Risk Score = **0.74** → **Partial Restriction**
- Escrow locked for ~11 days
- Transaction allowed but flagged for monitoring
- User receives risk explanation email
- Seller receives caution notice

---

## SLIDE 4: TECHNOLOGY STACK

### Frontend Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | React | 18.3.1 | UI library for dynamic components |
| **Language** | TypeScript | Latest | Type-safe development; catch errors early |
| **Build Tool** | Vite | 5.x | Fast dev server & optimized production builds |
| **Styling** | TailwindCSS | 3.x | Utility-first CSS framework |
| **Component Library** | Shadcn/UI | - | Radix UI primitives with Tailwind styling |
| **UI Primitives** | Radix UI | 1.x | Accessible, unstyled component primitives |
| **State Management** | React Query | 5.83.0 | Server state management & API caching |
| **Form Handling** | React Hook Form | 7.61.1 | Efficient form state & validation |
| **Validation** | Zod | 3.25.76 | TypeScript-first schema validation |
| **Routing** | React Router | 6.30.1 | SPA routing with lazy loading |
| **Charting** | Recharts | 2.15.4 | Risk visualization & transaction graphs |
| **Blockchain** | Ethers.js | 6.16.0 | Web3 interaction & wallet connection |
| **Animations** | Framer Motion | 12.34.2 | Smooth UI transitions & interactions |
| **Icons** | Lucide React | 0.462.0 | Beautiful SVG icons |
| **Date Handling** | date-fns | 3.6.0 | Lightweight date formatting |
| **Toast Notifications** | Sonner | 1.7.4 | Elegant notification system |
| **Theme Management** | next-themes | 0.3.0 | Dark/light mode support |
| **Testing** | Vitest | Latest | Fast unit test framework |
| **Testing Library** | React Testing Lib | 16.0.0 | Component testing utilities |

**Frontend Folder Structure**:
```
secure-escrow-hub/src/
├── components/
│   ├── admin/              # Admin dashboard pages
│   ├── common/             # Shared components (Nav, Footer)
│   ├── landing/            # Landing page
│   ├── layout/             # Layout templates
│   └── ui/                 # Shadcn/UI primitives
├── pages/
│   ├── Dashboard.tsx       # Escrow overview
│   ├── CreateEscrow.tsx    # Escrow creation flow
│   ├── Wallet.tsx          # Fund management
│   ├── Disputes.tsx        # Dispute handling
│   ├── KYC.tsx             # ID verification simulation
│   └── Login/Register.tsx  # Authentication
├── context/                # React Context for global state
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions & helpers
└── App.tsx                 # Main app component
```

---

### Backend Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | Express.js | 5.2.1 | HTTP server & API routing |
| **Language** | JavaScript (ES6+) | - | Dynamic, event-driven programming |
| **Database** | PostgreSQL (Neon) | 14+ | ACID compliance, JSON support, serverless |
| **Database Driver** | postgres.js | 3.4.9 | Modern, fast PostgreSQL client |
| **Authentication** | JWT | jsonwebtoken 9.0.3 | Stateless token-based auth |
| **Password Hashing** | bcrypt | 6.0.0 | Secure password storage |
| **Input Validation** | Joi | 18.0.2 | Schema validation for requests |
| **Password Complexity** | joi-password-complexity | 5.2.0 | Enforce strong passwords |
| **Email Service** | EmailJS | 5.0.2 | Send OTP & notifications without SMTP |
| **Web3/Blockchain** | Ethers.js | 6.16.0 | Interact with smart contracts |
| **Blockchain Queries** | The Graph (implied) | - | Query blockchain events |
| **Environment Config** | dotenv | 17.4.2 | Manage environment variables |
| **CORS** | cors | 2.8.5 | Cross-origin request handling |
| **UUID Generation** | uuid | 13.0.0 | Generate unique IDs |
| **Deployment** | Vercel | - | Serverless function deployment |

**Backend Folder Structure**:
```
backend-escrow/
├── modules/
│   ├── auth/               # Login, Register, OTP
│   │   ├── auth.controller.js
│   │   ├── auth.service.js
│   │   ├── auth.routes.js
│   │   ├── auth.middleware.js
│   │   ├── auth.validator.js
│   │   └── auth.helpers.js
│   ├── escrow/             # Escrow creation & management
│   │   ├── escrow.controller.js
│   │   ├── escrow.services.js
│   │   ├── escrow.routes.js
│   │   ├── escrow.validator.js
│   │   ├── blockchain.service.js
│   │   ├── sync.worker.js
│   │   ├── escrow.abi.json
│   │   └── escrow.deployment.json
│   ├── risk/               # Risk scoring engine
│   │   ├── risk.controller.js
│   │   ├── risk.services.js   # Core statistical models
│   │   ├── risk.routes.js
│   │   └── risk.validator.js
│   ├── users/              # Dashboard, disputes, wallet, settings
│   │   ├── dashboard.controller.js
│   │   ├── disputes.controller.js
│   │   ├── wallet.controller.js
│   │   ├── wallet.service.js
│   │   ├── settings.controller.js
│   │   ├── *.routes.js     # Routing for each feature
│   │   └── *.controller.js # Business logic
│   └── utils/
│       └── jwt.js          # JWT token generation/verification
├── src/
│   ├── app.js              # Express app config (middleware, routes)
│   ├── server.js           # Server entry point
│   ├── config/
│   │   └── db.js           # PostgreSQL connection setup
│   └── utils/
│       └── email.js        # Email notification utilities
├── scripts/
│   ├── setup-db.js         # Create tables on first run
│   ├── seed-sample-data.js # Dev data generation
│   ├── migrate-db.js       # Run migrations
│   └── test-*.js           # Debugging scripts
├── index.js                # Legacy entry point
└── package.json            # Dependencies
```

---

### Blockchain Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Smart Contracts** | Solidity | 0.8.20+ | Contract programming language |
| **Development Framework** | Hardhat | 2.28.6 | Contract development, testing, deployment |
| **Deployment Language** | JavaScript | ES6+ | Scripts for deploying contracts |
| **Testing Framework** | Hardhat Test | 2.28.6 | Contract unit tests |
| **Type Safety** | TypeScript | 5.x | Optional typing for hardhat configs |

**Blockchain Folder Structure**:
```
blockchain/
├── contracts/
│   ├── escrow.sol           # Main escrow contract
│   ├── Counter.sol          # Example contract
│   └── Counter.t.sol        # Test contract
├── scripts/
│   └── deploy.js            # Deployment script
├── test/
│   ├── Escrow.ts            # Escrow contract tests
│   └── Counter.ts           # Counter contract tests
├── ignition/
│   └── modules/             # Ignition deployment modules
├── hardhat.config.ts        # Hardhat configuration
├── package.json             # Dependencies
├── tsconfig.json
└── README.md
```

---

### Database Stack

**Database**: PostgreSQL (Neon Serverless)
**Connection**: postgres.js (async, modern driver)
**Deployment**: Vercel Functions + Neon Postgres

**Key Database Features Used**:
- ACID transactions for escrow state consistency
- JSON type for storing complex risk metrics
- INSERT ON CONFLICT for idempotent operations
- Window functions for historical analysis
- Custom indexes for query optimization

---

### Infrastructure & DevOps

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend Hosting** | Vercel | Serverless React deployment |
| **Backend Hosting** | Vercel Functions | Serverless Node.js API |
| **Database** | Neon (Serverless Postgres) | Auto-scaling database with read replicas |
| **Package Manager** | pnpm | Fast, disk-space efficient |
| **Version Control** | Git | Code management |
| **Blockchain Network** | Ethereum (Testnet initially) | Smart contract deployment |
| **Contract Deployment** | Hardhat + Ignition | Scripted, automated deployments |

---

## SLIDE 5: BACKEND MODULES & IMPLEMENTATION

### 5.1 Authentication Module (`modules/auth/`)

**Responsibility**: User registration, login, OTP verification, session management

**Key Files**:
- `auth.controller.js`: Handle HTTP requests
- `auth.service.js`: Business logic (empty, logic in controller)
- `auth.routes.js`: Define endpoints
- `auth.validator.js`: Input validation schemas
- `auth.middleware.js`: JWT verification middleware
- `auth.helpers.js`: OTP generation utilities

**Authentication Flow**:

```
Registration Flow:
  1. User provides email
  2. Email validation schema applied
  3. OTP generated (6 digits, 10-min expiry)
  4. OTP sent via EmailJS
  5. User receives OTP and enters with password
  6. Password hashed with bcrypt (10 salt rounds)
  7. User created in database
  8. Marked OTP as used
  9. Return success

Login Flow:
  1. User provides email + password
  2. Query user from database
  3. bcrypt.compare() password
  4. If valid: Generate JWT token
  5. Return token in response
  6. Client stores in localStorage/sessionStorage
  7. Include in Authorization header for future requests

Protected Route Access:
  1. Client sends: Authorization: Bearer <token>
  2. authMiddleware extracts token
  3. jsonwebtoken.verify() validates
  4. Extract user ID from decoded token
  5. Set req.user.id for controller use
  6. Next middleware/controller executes
  7. If invalid/expired: Return 403
```

**OTP Service** (via EmailJS):
```
emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY
});

// OTP stored in otp_requests table with:
- email
- otp (6-digit code)
- created_at (timestamp)
- expires_at (created_at + 10 minutes)
- is_used (boolean flag)

Rate limiting: One OTP per email at a time
```

**Key Endpoints**:
```javascript
POST /auth/register
  Body: { email, password, name, phone, otp }
  Response: { user: { id, email } }

POST /auth/login
  Body: { email, password }
  Response: { token: "jwt_token_here" }

POST /auth/generate-otp
  Body: { email }
  Response: { message: "OTP sent" }
```

---

### 5.2 Escrow Module (`modules/escrow/`)

**Responsibility**: Escrow creation, state management, blockchain integration, synchronization

**Key Files**:
- `escrow.controller.js`: Handle HTTP requests
- `escrow.services.js`: Business logic (empty)
- `escrow.routes.js`: Define endpoints
- `blockchain.service.js`: Ethers.js integration
- `sync.worker.js`: Continuous blockchain event monitoring
- `escrow.abi.json`: Contract ABI for ethers.js
- `escrow.deployment.json`: Deployment addresses

**Escrow State Machine**:
```
            ┌─────────┐
            │ Created │ (Buyer locked funds)
            └────┬────┘
                 │ [Seller marks delivery]
                 ▼
            ┌─────────┐
            │Delivered│ (Goods sent, awaiting payment)
            └───┬──┬──┘
                │  │
       [Release]│  │[Dispute]
                │  │
                ▼  ▼
            ┌────┬────┐
            │    │    │
         ┌──▼──┐ ┌──▼──────┐
         │Rele-│ │Disputed │
         │ased │ └────┬────┘
         └─────┘      │ [Arbiter resolves]
                      ▼
                  ┌──────────┐
                  │Resolved  │
                  │(Buyer/   │
                  │ Seller)  │
                  └──────────┘
```

**createEscrow Endpoint** (Step-by-step):
```javascript
POST /escrow/create
  Input: {
    seller_id or counterparty_name,
    amount (in dollars),
    description,
    tx_hash_create (from blockchain),
    chain_id,
    contract_address
  }

  Validation:
    1. Require authenticated user (buyer)
    2. Validate amount > 0
    3. Lookup seller by ID or name
    4. Buyer ≠ Seller check
    5. Verify tx_hash on blockchain
  
  Processing:
    1. Compute risk scores for buyer using risk.services
    2. Get buyer's current reliability_score
    3. Store in escrows table:
       - buyer_id, seller_id, amount
       - state = 'created'
       - buyer_r_at_creation (snapshot of reliability)
       - suspicion_f_at_lock (risk score at lock)
       - on_chain = TRUE
       - onchain_escrow_id (from tx receipt)
       - tx_hash_create, chain_id, contract_address
       - onchain_status = 'created'
    
    4. Send email notifications:
       - Buyer: "Escrow created, funds locked"
       - Seller: "Escrow invitation from [buyer]"
    
    5. Return {
       escrow: { ...escrow_record },
       riskScores: {
         rolling: 0.3,
         cusum: 0.2,
         surge: 0.1,
         finalScore: 0.24,
         level: 'normal'
       }
    }
```

**Blockchain Integration** (`blockchain.service.js`):
```javascript
// Verify transaction occurred on blockchain
async function verifyEscrowCreateTx(txHash) {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const receipt = await provider.getTransactionReceipt(txHash);
  
  // Parse contract events from receipt
  const escrowId = parseEventLog(receipt, 'EscrowCreated');
  const chainId = receipt.chainId;
  
  return { escrowId, chainId, contractAddress: recipient }
}

// Get current state of escrow from blockchain
async function getEscrowOnChain(escrowId) {
  contract methods:
    - escrows(escrowId) → returns EscrowDeal struct
    - getStatus(escrowId) → returns current status enum
}

// Release funds from escrow
async function releaseFundsOnChain(escrowId) {
  contract.releaseFunds(escrowId) 
  // Funds transferred from contract to seller
}
```

**Continuous Sync Worker** (`sync.worker.js`):
```
Runs every 20 seconds:
  1. Query blockchain for new EscrowCreated events since last_block
  2. Query blockchain for EscrowDelivered events since last_block
  3. Query blockchain for EscrowReleased events since last_block
  4. Query blockchain for EscrowDisputed events since last_block
  5. Query blockchain for EscrowResolved events since last_block
  
  For each event:
    - Lookup escrow record in DB
    - Update state field to match blockchain status
    - Update onchain_status field
    - Record event timestamp
    - Trigger any notifications needed
  
  Update chain_sync_cursor table with latest block processed
```

---

### 5.3 Risk Module (`modules/risk/`)

**Responsibility**: Multi-factor risk scoring, statistical calculations

**Key File**: `risk.services.js`

**Core Functions**:

```javascript
// 1. Calculate Z-Score (Rolling anomaly)
async function calculateZScore(userId, currentAmount) {
  // Get 30-day transaction history
  const transactions = await sql`
    SELECT amount FROM transactions 
    WHERE user_id = ${userId} 
    AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    AND type = 'escrow_lock'
  `;
  
  // Calculate mean and stddev
  const mean = avg(amounts);
  const stddev = stdev(amounts);
  
  // Z-score = (current - mean) / stddev
  return (currentAmount - mean) / stddev;
}

// 2. Calculate CUSUM (Drift detection)
async function calculateCusumValue(userId, currentAmount) {
  // Get or initialize CUSUM state
  let state = await sql`SELECT s_pos, s_neg FROM cusum_state WHERE user_id = ${userId}`;
  
  // Get baseline statistics
  const baseline = await sql`
    SELECT AVG(amount) as mean, STDDEV(amount) as stddev
    FROM transactions
    WHERE user_id = ${userId}
    AND created_at >= CURRENT_DATE - INTERVAL '90 days'
  `;
  
  // CUSUM parameters
  const k = 0.5 * baseline.stddev;
  const h = 5 * baseline.stddev;
  
  // Update CUSUM
  const mu = baseline.mean + k;
  s_pos = Math.max(0, s_pos + (currentAmount - mu));
  s_neg = Math.max(0, s_neg + (mu - currentAmount));
  
  // Save state
  await sql`UPDATE cusum_state SET s_pos = ${s_pos}, s_neg = ${s_neg} WHERE user_id = ${userId}`;
  
  return Math.max(s_pos, s_neg);
}

// 3. Calculate Surge (Burst detection)
async function calculateSurgeRatio(userId) {
  // Count transactions in last 24 hours
  const recent = await sql`
    SELECT COUNT(*) as count FROM transactions
    WHERE user_id = ${userId}
    AND created_at >= NOW() - INTERVAL '24 hours'
  `;
  
  // Average daily (last 30 days)
  const avgDaily = await sql`
    SELECT COUNT(*) / 30.0 as avg FROM transactions
    WHERE user_id = ${userId}
    AND created_at >= CURRENT_DATE - INTERVAL '30 days'
  `;
  
  return recent.count / avgDaily.avg;
}

// 4. Compute all risk scores
async function computeRiskScores(userId, currentAmount) {
  const z = await calculateZScore(userId, currentAmount);
  const cusumValue = await calculateCusumValue(userId, currentAmount);
  const surge = await calculateSurgeRatio(userId);
  
  const sRolling = Math.min(1, Math.abs(z) / 6);
  const sCusum = Math.min(1, cusumValue / (5 * stdev));
  const sSurge = Math.min(1, surge / 6);
  
  const finalScore = 0.4 * sRolling + 0.35 * sCusum + 0.25 * sSurge;
  const riskLevel = getRiskLevel(finalScore);
  
  // Log to suspicion_logs table
  await sql`
    INSERT INTO suspicion_logs (user_id, risk_score, rolling_score, cusum_score, surge_score, risk_level, transaction_amount, created_at)
    VALUES (${userId}, ${finalScore}, ${sRolling}, ${sCusum}, ${sSurge}, ${riskLevel}, ${currentAmount}, NOW())
  `;
  
  return {
    rolling: sRolling,
    cusum: sCusum,
    surge: sSurge,
    finalScore,
    level: riskLevel
  };
}
```

**Key Endpoints**:
```javascript
POST /risk/compute
  Body: { amount, buyer_id (optional) }
  Response: { rolling, cusum, surge, finalScore, level }

GET /risk/suspicion-history?user_id=123
  Response: [ { created_at, risk_score, level }, ... ]
```

---

### 5.4 Wallet Module (`modules/users/wallet.*`)

**Responsibility**: Fund management (deposits, withdrawals, balance tracking)

**Key Functions**:
```javascript
// Get wallet balance
async function getBalance(userId) {
  const balance = await sql`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM wallet_transactions
    WHERE user_id = ${userId}
  `;
  return balance[0].total;
}

// Deposit funds (simulated)
async function deposit(userId, amount) {
  // In real app: integrate with Stripe, bank transfer, etc.
  await sql`
    INSERT INTO wallet_transactions (user_id, type, amount, created_at)
    VALUES (${userId}, 'deposit', ${amount}, NOW())
  `;
}

// Withdraw funds
async function withdraw(userId, amount, walletAddress) {
  // Check balance
  const balance = await getBalance(userId);
  if (balance < amount) throw new Error('Insufficient balance');
  
  // Record withdrawal
  await sql`
    INSERT INTO wallet_transactions (user_id, type, amount, wallet_address, created_at)
    VALUES (${userId}, 'withdrawal', ${amount}, ${walletAddress}, NOW())
  `;
}

// Transfer to escrow (locking funds)
async function lockFundsForEscrow(userId, escrowId, amount) {
  await sql`
    INSERT INTO wallet_transactions (user_id, type, amount, related_escrow_id, created_at)
    VALUES (${userId}, 'escrow_lock', ${amount}, ${escrowId}, NOW())
  `;
}
```

---

### 5.5 Disputes Module (`modules/users/disputes.*`)

**Responsibility**: Dispute creation, resolution, arbiter decisions

**Key Functions**:
```javascript
// Create dispute
async function createDispute(userId, escrowId, reason) {
  const dispute = await sql`
    INSERT INTO disputes (escrow_id, raised_by_user_id, reason, created_at, status)
    VALUES (${escrowId}, ${userId}, ${reason}, NOW(), 'open')
    RETURNING *
  `;
  
  // Update escrow state
  await sql`
    UPDATE escrows SET state = 'disputed', onchain_status = 'disputed'
    WHERE id = ${escrowId}
  `;
  
  return dispute;
}

// Resolve dispute (Arbiter decision)
async function resolveDispute(userId, disputeId, decision, releaseToSeller) {
  // Verify user is arbiter
  
  const dispute = await sql`
    UPDATE disputes
    SET status = 'resolved', resolution = ${decision}, resolved_at = NOW(), arbiter_decision_seller = ${releaseToSeller}
    WHERE id = ${disputeId}
    RETURNING *
  `;
  
  // Update escrow
  await sql`
    UPDATE escrows
    SET state = 'resolved', onchain_status = ${releaseToSeller ? 'resolved_seller' : 'resolved_buyer'}
    WHERE id = ${dispute.escrow_id}
  `;
  
  // Release funds via blockchain
  const contract = new ethers.Contract(contractAddress, ABI, signer);
  await contract.resolveDispute(dispute.onchain_escrow_id, releaseToSeller);
  
  return dispute;
}
```

---

## SLIDE 6: FRONTEND ARCHITECTURE & PAGES

### 6.1 Page Structure

**Authentication Pages**:
- `Login.tsx`: Email + password login
- `Register.tsx`: OTP-based registration flow
- Redirect unauthenticated users to login

**Main Application Pages**:

1. **Dashboard.tsx**
   - Overview of all escrows (active, completed, disputed)
   - Transaction history
   - User profile summary
   - Quick actions: Create Escrow, View Wallet

2. **CreateEscrow.tsx**
   - Select counterparty (seller)
   - Enter amount
   - Enter description/terms
   - **Risk Preview Component**: Shows real-time risk score as amount changes
   - Connect wallet → Approve transaction on blockchain
   - Submit escrow

3. **Wallet.tsx**
   - Current balance display
   - Deposit form
   - Withdrawal form
   - Transaction history
   - Fund escrow quick access

4. **Disputes.tsx**
   - List my disputes
   - Create new dispute (if escrow locked for 48h+ without release)
   - View dispute details
   - Add evidence/messages
   - If arbiter: Resolve dispute section

5. **CounterpartyProfile.tsx**
   - Seller's full name, email
   - Reliability score (0-1, visual bar)
   - Transaction statistics (completed, disputed count)
   - User reviews/feedback
   - Trust indicators

6. **KYC.tsx** (Simulated)
   - ID upload interface
   - Verification status display
   - Mock verification completion flow

7. **Settings.tsx**
   - Profile: name, email, phone
   - Security: Change password, Security PIN
   - Notifications: Email preferences
   - Wallet: Connected wallet address

---

### 6.2 Key Components

**Risk Visualization Component**:
```typescript
interface RiskScoreProps {
  score: number;           // 0 to 1
  level: 'normal' | 'monitoring' | 'partial_restriction' | 'immediate_freeze';
  breakdown: {
    rolling: number;
    cusum: number;
    surge: number;
  };
}

export function RiskScoreDisplay({ score, level, breakdown }: RiskScoreProps) {
  // Renders:
  // - Large circular progress indicator (0-1)
  // - Color-coded by risk level (green→yellow→orange→red)
  // - Breakdown bars for rolling/cusum/surge
  // - Escrow duration estimate
  // - Risk explanation text
  // - "Learn more" link to risk documentation
}
```

**Transaction History Component**:
```typescript
export function TransactionHistory({ userId }: { userId: string }) {
  const { data: transactions } = useQuery({
    queryKey: ['transactions', userId],
    queryFn: () => fetch(`/api/transactions?user_id=${userId}`).then(r => r.json())
  });
  
  // Renders list of transactions with:
  // - Counterparty name
  // - Amount & direction (sent/received)
  // - Status (pending, completed, disputed)
  // - Date
  // - Action buttons (view, dispute if applicable)
}
```

**Wallet Balance Component**:
```typescript
export function WalletBalance({ userId }: { userId: string }) {
  const { data: balance } = useQuery({
    queryKey: ['balance', userId],
    queryFn: () => fetch(`/api/wallet/balance?user_id=${userId}`).then(r => r.json())
  });
  
  // Renders:
  // - Large balance display (formatted currency)
  // - Deposit button
  // - Withdraw button
  // - Transaction history
}
```

**Escrow State Timeline Component**:
```typescript
export function EscrowTimeline({ escrow }: { escrow: Escrow }) {
  // Renders timeline showing:
  // - Created: [date/time] ✓
  // - Delivered: [date/time] or Pending
  // - Release Window: [calculated days]
  // - Released: [date/time] or Pending
  // - Or Disputed: [date] with resolution status
}
```

---

### 6.3 State Management (React Query)

All API data managed through React Query for:
- Automatic caching
- Background refetching
- Optimistic updates
- Stale-while-revalidate pattern

```typescript
// Example: Create escrow mutation
const createEscrowMutation = useMutation({
  mutationFn: (data) => fetch('/api/escrow/create', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json()),
  
  onSuccess: (result) => {
    // Invalidate and refetch escrow list
    queryClient.invalidateQueries({ queryKey: ['escrows'] });
    // Show success toast
    toast.success('Escrow created successfully');
    // Navigate to dashboard
    navigate('/dashboard');
  },
  
  onError: (error) => {
    toast.error(`Failed: ${error.message}`);
  }
});
```

---

### 6.4 Wallet Connection (Ethers.js)

```typescript
export function useWalletConnection() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  
  const connectWallet = async () => {
    if (!window.ethereum) throw new Error('MetaMask not found');
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    
    setProvider(provider);
    setSigner(signer);
    setAddress(accounts[0]);
  };
  
  return { provider, signer, address, connectWallet };
}

// Usage in component:
const { provider, signer, address, connectWallet } = useWalletConnection();

// Create escrow on blockchain:
const createEscrowTx = async (seller, amount, terms) => {
  const contract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);
  const tx = await contract.createEscrow(seller, terms, { value: ethers.parseEther(amount) });
  const receipt = await tx.wait();
  
  return receipt.transactionHash;
};
```

---

## SLIDE 7: DATABASE SCHEMA

### Core Tables

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20) UNIQUE,
    reliability_score DECIMAL(3,2) DEFAULT 0.5,  -- 0.0 to 1.0
    security_pin VARCHAR(6),
    kyc_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTP Requests (for email verification)
CREATE TABLE otp_requests (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_used BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_otp_email on otp_requests(email);

-- Wallet Transactions (fund movements)
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50),  -- 'deposit', 'withdrawal', 'escrow_lock', 'escrow_release'
    amount DECIMAL(15,2) NOT NULL,
    wallet_address VARCHAR(255),
    related_escrow_id UUID,  -- FK to escrows
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_wallet_user ON wallet_transactions(user_id);

-- Escrow Agreements
CREATE TABLE escrows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES users(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    state VARCHAR(50),  -- 'created', 'delivered', 'released', 'disputed', 'resolved'
    buyer_r_at_creation DECIMAL(3,2),  -- Buyer reliability snapshot
    suspicion_f_at_lock DECIMAL(5,4),   -- Risk score at lock time
    on_chain BOOLEAN DEFAULT TRUE,
    onchain_escrow_id VARCHAR(255),     -- Contract escrow ID
    tx_hash_create VARCHAR(255),        -- Create transaction hash
    chain_id INTEGER,                   -- Blockchain chain ID
    contract_address VARCHAR(255),      -- Smart contract address
    onchain_status VARCHAR(50),  -- 'created', 'delivered', 'released', 'disputed', etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_escrow_buyer ON escrows(buyer_id);
CREATE INDEX idx_escrow_seller ON escrows(seller_id);
CREATE INDEX idx_escrow_state ON escrows(state);

-- Transaction History (for risk scoring)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50),  -- 'escrow_lock', 'escrow_release', 'transfer'
    amount DECIMAL(15,2) NOT NULL,
    related_escrow_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_tx_user ON transactions(user_id);
CREATE INDEX idx_tx_created ON transactions(created_at);

-- CUSUM State (for drift detection)
CREATE TABLE cusum_state (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    s_pos DECIMAL(15,2) DEFAULT 0,     -- Positive cumulative sum
    s_neg DECIMAL(15,2) DEFAULT 0,     -- Negative cumulative sum
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Risk Evaluation History
CREATE TABLE suspicion_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    risk_score DECIMAL(5,4) NOT NULL,
    rolling_score DECIMAL(5,4),
    cusum_score DECIMAL(5,4),
    surge_score DECIMAL(5,4),
    risk_level VARCHAR(50),  -- 'normal', 'monitoring', 'partial_restriction', 'immediate_freeze'
    transaction_amount DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_suspicion_user ON suspicion_logs(user_id);

-- Reliability Score History
CREATE TABLE reliability_history (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    old_score DECIMAL(3,2),
    new_score DECIMAL(3,2),
    reason VARCHAR(255),  -- 'completed_transaction', 'disputed_transaction', etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Disputes Table
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escrow_id UUID NOT NULL REFERENCES escrows(id),
    raised_by_user_id UUID NOT NULL REFERENCES users(id),
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open',  -- 'open', 'in_arbitration', 'resolved'
    resolution TEXT,
    arbiter_decision_seller BOOLEAN,  -- TRUE = release to seller, FALSE = refund buyer
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);
CREATE INDEX idx_dispute_escrow ON disputes(escrow_id);

-- Blockchain Sync Cursor (tracks last processed block)
CREATE TABLE chain_sync_cursor (
    id SERIAL PRIMARY KEY,
    chain_id INTEGER NOT NULL,
    contract_address VARCHAR(255) NOT NULL,
    last_block_processed BIGINT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(chain_id, contract_address)
);
```

---

## SLIDE 8: SECURITY IMPLEMENTATION

### 8.1 Authentication Security

**Password Security**:
```javascript
// Registration password validation
const passwordSchema = Joi.string()
  .min(8)
  .max(50)
  .required()
  .password();  // Requires: uppercase, lowercase, numbers, special chars

// Hashing
const hashedPassword = await bcrypt.hash(password, 10);
  // Salt rounds: 10 (2^10 = 1024 iterations)
  // Time to hash: ~200ms (brute-force resistant)
  // Cost: exponential with rounds; 11 = 2x time, 12 = 4x time
```

**JWT Token System**:
```javascript
// Token generation
function jwtSign({ id, email, phone }) {
  return jwt.sign(
    { id, email, phone },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }  // 7-day expiration
  );
}

// Token verification (authMiddleware)
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) return res.status(401).send('No token provided');
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Attach to request
    next();
  } catch (err) {
    res.status(403).send('Invalid or expired token');
  }
}
```

**OTP Email Verification**:
```javascript
// Generate OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store in database with expiry
await sql`
  INSERT INTO otp_requests (email, otp, created_at, expires_at)
  VALUES (${email}, ${otp}, NOW(), NOW() + INTERVAL '10 minutes')
`;

// Verify OTP before registration
async function verifyOtp(email, otp) {
  const result = await sql`
    SELECT * FROM otp_requests
    WHERE email = ${email}
    AND otp = ${otp}
    AND is_used = FALSE
    AND NOW() < expires_at
  `;
  return result.length > 0;
}
```

### 8.2 Input Validation

**Joi Schemas** (prevent injection attacks):
```javascript
// Registration validation
const registerValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().password().required(),
    name: Joi.string().max(255),
    phone: Joi.string().max(20),
    otp: Joi.string().length(6).required()
  });
  return schema.validate(data);
};

// Escrow creation validation
const escrowValidation = (data) => {
  const schema = Joi.object({
    seller_id: Joi.string().uuid(),
    counterparty_name: Joi.string().max(255),
    amount: Joi.number().positive().required(),
    description: Joi.string().max(500),
    tx_hash_create: Joi.string().required()
  });
  return schema.validate(data);
};
```

### 8.3 Transaction Security

**Blockchain Verification**:
```javascript
async function verifyEscrowCreateTx(txHash) {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const receipt = await provider.getTransactionReceipt(txHash);
  
  // Verify:
  // 1. Transaction was confirmed (receipt !== null)
  if (!receipt) throw new Error('Transaction not found');
  
  // 2. Transaction succeeded (status === 1)
  if (receipt.status !== 1) throw new Error('Transaction failed');
  
  // 3. Event was emitted (correct contract called)
  const events = receipt.logs.map(log => {
    return iface.parseLog(log);
  });
  
  // 4. Extract escrow ID from event
  const escrowId = events[0].args.escrowId;
  
  return { escrowId, chainId: receipt.chainId };
}
```

### 8.4 API Security

**CORS Configuration**:
```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://secure-escrow-hub.vercel.app',
    process.env.FRONTEND_URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Rate Limiting** (via OTP request tracking):
```javascript
// One OTP per email max
async function requestOtp(email) {
  const existing = await sql`
    SELECT * FROM otp_requests
    WHERE email = ${email}
    AND is_used = FALSE
    AND NOW() < expires_at
  `;
  
  if (existing.length > 0) {
    throw new Error('OTP already sent to this email. Please wait for expiry.');
  }
  
  // Generate and send new OTP
}
```

---

## SLIDE 9: DATA FLOW EXAMPLES

### Example 1: Complete Escrow Transaction

```
Timeline:
---------

T=0:00
  ┌─ User Alice (buyer) wants to purchase laptop from Bob (seller)
  ├─ Alice opens CreateEscrow page
  ├─ Selects Bob as counterparty
  ├─ Enters amount: $500
  └─ Backend calculates risk:
     ├─ 30-day history: avg $200, stddev $50
     ├─ Current: $500 → Z = (500-200)/50 = 6.0
     ├─ Rolling = min(1, 6/6) = 1.0 (EXTREME!)
     ├─ CUSUM = 0.4 (no previous drift)
     ├─ Surge = 0.5 (normal daily activity)
     ├─ Final = 0.4(1.0) + 0.35(0.4) + 0.25(0.5) = 0.67
     └─ Risk Level = PARTIAL_RESTRICTION

T=0:10
  Frontend displays:
  ├─ ⚠️ Risk Score: 0.67 (ORANGE/HIGH)
  ├─ Breakdown: Rolling 100%, CUSUM 40%, Surge 50%
  └─ "Large transaction detected. Escrow will be locked for 10 days."

T=0:15
  Alice approves transaction in MetaMask
  └─ Smart contract receives $500 in createEscrow() call
     └─ EscrowCreated event emitted
     └─ Transaction hash: 0xabc123...

T=0:20
  Backend receives tx hash
  ├─ Verifies it on blockchain ✓
  ├─ Stores in escrows table:
  │  - amount: 500
  │  - state: 'created'
  │  - suspicion_f_at_lock: 0.67
  │  - onchain_escrow_id: 1
  │  - onchain_status: 'created'
  └─ Sends emails:
     ├─ To Alice: "Your $500 escrow with Bob is locked. Release date: [+10 days]"
     └─ To Bob: "Alice wants to buy laptop for $500. Confirm delivery when ready."

T=1 day
  Bob confirms he has delivered the laptop
  └─ markDelivered() called on blockchain
     └─ EscrowDelivered event emitted
     └─ DB state updated: 'delivered'

T=10 days
  Alice receives notification: "Escrow release window is now open"
  ├─ Alice clicks "Release Funds"
  ├─ Calls contract.releaseFunds()
  └─ Transaction executed:
     ├─ EscrowReleased event
     ├─ $500 transferred from contract to Bob's wallet
     ├─ DB state updated: 'released'

T=10 days + 1 hour
  ├─ Alice's reliability_score updated:
  │  - Old: 0.5
  │  - Outcome: 1.0 (successful, no dispute)
  │  - New = 0.7(0.5) + 0.3(1.0) = 0.65 ↑
  └─ Bob's reliability_score updated:
     - Old: 0.6
     - Outcome: 1.0 (no issues)
     - New = 0.7(0.6) + 0.3(1.0) = 0.72 ↑

Next time:
  Alice's next $500 transaction:
  ├─ 30-day history now includes this $500
  ├─ Mean → higher, stddev → higher
  ├─ New Z-score → lower
  ├─ Rolling score → lower
  └─ Risk assessment improves naturally from building transaction history
```

### Example 2: Dispute Resolution

```
Timeline:
---------

T=12 days (2 days after release deadline)
  Alice hasn't received laptop yet
  ├─ Opens Disputes page
  ├─ Creates dispute on Bob's escrow
  ├─ Attaches proof: "No package arrived"
  └─ Contract.raiseDispute() called
     └─ EscrowDisputed event
     └─ DB state: 'disputed'

T=12 days + 1 hour
  Admin/Arbiter receives notification
  ├─ Views dispute details:
  │  ├─ Alice's reliability: 0.65 (good)
  │  ├─ Bob's reliability: 0.72 (good)
  │  ├─ Previous transactions: 0 disputes between them
  │  ├─ Amount: $500
  │  └─ Evidence from Alice: photo of tracking showing undelivered
  └─ Decision: Favor Alice (refund buyer)

T=12 days + 2 hours
  Arbiter calls contract.resolveDispute(escrowId, releaseToSeller=FALSE)
  ├─ $500 transferred from contract back to Alice
  ├─ EscrowResolved event
  ├─ DB updates:
  │  ├─ dispute.status = 'resolved'
  │  ├─ dispute.resolution = 'Seller failed to deliver'
  │  ├─ disputes.arbiter_decision_seller = FALSE
  │  └─ escrow.state = 'resolved'

T=12 days + 3 hours
  Reliability scores updated:
  ├─ Alice:
  │  - Outcome: 0.5 (partially disputed, but refunded)
  │  - New = 0.7(0.65) + 0.3(0.5) = 0.655 (slight decrease)
  └─ Bob:
     - Outcome: 0.0 (failed to deliver)
     - New = 0.7(0.72) + 0.3(0.0) = 0.504 ↓ (significant decrease)

Future Impact:
  Bob's next transaction:
  ├─ Baseline reliability: now 0.504 (below neutral)
  ├─ Risk scoring will be more strict
  ├─ Lock periods will be longer
  └─ Potential amount caps if score drops further
```

---

## SLIDE 10: TECHNOLOGY COMPARISON & JUSTIFICATION

### Why This Tech Stack?

| Choice | Alternative | Why We Chose Us |
|--------|-------------|-----------------|
| **Express.js** | Django, FastAPI, Rails | Fast HTTP framework; rich Node ecosystem; JSON APIs; easy deployment on Vercel |
| **PostgreSQL** | MongoDB, Firebase | ACID transactions (money!); powerful queries; proven for financial systems; Neon serverless |
| **Ethers.js** | Web3.js | Modern API; better TypeScript support; smaller bundle; batch operations |
| **Solidity 0.8.20** | Vyper | Industry standard; largest community; most audited; best tooling |
| **React** | Vue, Angular | Component reusability; largest ecosystem; Vite + TS is fast |
| **TailwindCSS** | Bootstrap, Material-UI | Utility-first flexibility; smaller bundle; rapid UI development |
| **Shadcn/UI** | MUI, Chakra | Headless, fully customizable; no dependency hell; copy-paste components |
| **Vite** | Next.js, Create-React-App | Lightning-fast dev server; optimized builds; modern toolchain |
| **Serverless (Vercel)** | Heroku, AWS EC2 | Cost-effective; auto-scaling; no infrastructure; Git-based deployments |
| **Neon Postgres** | Traditional RDS | Auto-scaling; branching for dev/test; built-in backups; pay-as-you-go |

---

## SLIDE 11: DEPLOYMENT & DEVOPS

### Deployment Architecture

```
                     Git Push
                        │
                        ▼
                   GitHub Repo
                        │
                ┌───────┴────────┐
                │                │
                ▼                ▼
            Frontend          Backend
            (React)           (Node.js)
             │                  │
        Vercel Build       Vercel Build
             │                  │
             ▼                  ▼
        Dist/ (SPA)      Serverless Function
             │                  │
             ├─ HTML/JS/CSS     └─ /api/* routes
             ├─ Assets          └─ Runs on-demand
             └─ Vercel CDN
                        
                     ┌──────────────┐
                     │ Neon Postgres│
                     │  (Serverless)│
                     │ - Auto-scale │
                     │ - Read rep   │
                     │ - Backups    │
                     └──────────────┘
                           ▲
                           │
                     SQL Queries
                           
                     ┌──────────────┐
                     │  Ethereum    │
                     │   RPC Node   │
                     │  (Infura/    │
                     │   Alchemy)   │
                     └──────────────┘
```

### Environment Variables Required

```bash
# Database
DATABASE_URL=postgresql://user:pass@db.neon.tech/database

# Web3
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
ETHERS_PRIVATE_KEY=0x...

# Authentication
JWT_SECRET=your_jwt_secret_here

# Email
EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_PRIVATE_KEY=your_private_key

# Frontend
VITE_API_URL=https://api.yourdomain.com
VITE_CONTRACT_ADDRESS=0x...
```

### Deployment Steps

```bash
# Frontend
cd secure-escrow-hub
npm run build  # Generates dist/ folder
# Vercel auto-detects and deploys

# Backend
cd backend-escrow
# Vercel deploys serverless functions from index.js

# Database
pnpm run setup-db  # Creates tables on first deployment

# Smart Contracts (manual)
cd blockchain
npx hardhat run scripts/deploy.js --network sepolia
# Get deployed address → update .env files
```

---

## SLIDE 12: PROJECT STATUS & ROADMAP

### Completed (✅)

**Week 1-2: Foundation & Research**
- Project initialization & scaffolding
- Literature review on risk-based approaches
- Fraud risk scoring research

**Week 3-4: Core Features & Integration**
- Authentication system (OTP + JWT)
- Escrow module (creation, state management)
- Smart contract deployment
- Frontend-backend integration
- User profile management

**Week 5-6: Advanced Features**
- Risk scoring engine (Rolling + CUSUM + Surge)
- Dispute resolution module
- Admin dashboard frontend
- Blockchain sync worker

**Week 7-8: Refinement & Deployment**
- KYC simulation module
- All critical bug fixes
- Build optimizations
- Vercel deployment configuration

**Commits & Changes**: ~154K+ changes across all modules

### In Progress / Planned (🔄)

**Short-term**:
- [ ] Real KYC integration (ID verification APIs)
- [ ] Email notification enhancements
- [ ] More comprehensive test coverage
- [ ] UPI micropayment gateway integration
- [ ] Region-specific compliance checks
- [ ] Advanced arbitration workflow
- [ ] Transaction analytics dashboard

**Medium-term**:
- [ ] Multi-chain support (Polygon, Optimism)
- [ ] Mobile app (React Native)
- [ ] Advanced reputation scoring
- [ ] Machine learning fraud detection
- [ ] Automated dispute resolution (ML)
- [ ] Cross-border escrow (currency conversion)

**Long-term**:
- [ ] Decentralized arbiter network (DAO)
- [ ] Staking for arbiters
- [ ] Native token (for incentives)
- [ ] Metaverse integration
- [ ] Enterprise B2B escrow features

---

## SLIDE 13: KEY FORMULAS REFERENCE

### Quick Formula Guide

**1. Z-Score (Anomaly Detection)**
$$Z = \frac{X - \mu}{\sigma}$$

**2. Rolling Score**
$$S_{rolling} = \min\left(1, \frac{|Z|}{6}\right)$$

**3. CUSUM Update**
$$S^+_t = \max(0, S^+_{t-1} + (x_t - \mu - k))$$
$$S^-_t = \max(0, S^-_{t-1} + (\mu + k - x_t))$$

**4. CUSUM Score**
$$S_{CUSUM} = \min\left(1, \frac{\max(S^+_t, S^-_t)}{h}\right)$$

**5. Surge Score**
$$S_{Surge} = \min\left(1, \frac{\text{Recent Transactions}}{\text{Average Daily}} \times \frac{1}{6}\right)$$

**6. Final Risk Score**
$$\text{Risk} = 0.4 \times S_{rolling} + 0.35 \times S_{CUSUM} + 0.25 \times S_{Surge}$$

**7. Escrow Lock Duration**
$$\text{Lock Days} = 3 + 11 \times \text{Risk Score}$$

**8. Reliability Score Update** (Exponential Smoothing)
$$R_{new} = 0.7 \times R_{old} + 0.3 \times \text{Outcome}$$

---

## SLIDE 14: KEY ACHIEVEMENTS & METRICS

### Development Metrics

| Metric | Value |
|--------|-------|
| **Total Commits** | 154,000+ changes across 8 weeks |
| **Code Files** | 50+ source files (frontend + backend + contracts) |
| **Smart Contract Functions** | 12 core functions + 5 events |
| **Database Tables** | 10 core tables with proper indexing |
| **API Endpoints** | 20+ RESTful endpoints |
| **Frontend Pages** | 8 main pages + components |
| **Test Coverage** | Vitest + Hardhat tests included |
| **Risk Model Factors** | 3 independent statistical signals |

### Feature Completeness

✅ **Core Escrow Features**
- Escrow creation with blockchain verification
- Multi-state workflow (Created → Delivered → Released)
- Dispute resolution with arbiter
- Fund custody and release

✅ **Risk Management**
- Multi-factor risk scoring
- Statistical models (Z-score, CUSUM, Surge)
- Adaptive escrow duration
- Risk visualization

✅ **Security**
- OTP-based registration
- JWT authentication
- Bcrypt password hashing
- Blockchain transaction verification
- Input validation (Joi schemas)

✅ **User Experience**
- Wallet integration (MetaMask)
- Real-time risk preview
- Transaction history
- Reputation tracking
- Email notifications

✅ **Infrastructure**
- Serverless deployment (Vercel)
- PostgreSQL database (Neon)
- Blockchain integration (Ethers.js)
- Continuous sync worker
- Event-driven architecture

---

## SLIDE 15: CONCLUSION & IMPACT

### Problem → Solution → Impact

**Problem**: Traditional escrow applies static rules to all transactions; risky transactions aren't protected enough, low-risk transactions are over-protected.

**Solution**: Adaptive, mathematically rigorous risk-based escrow system that:
- Quantifies fraud risk using three independent statistical models
- Dynamically adjusts protections based on risk score
- Maintains immutability on blockchain while computing intelligence off-chain
- Provides transparent risk explanations to users

**Impact**:
- **For Buyers**: Proportional protection; peace of mind on high-risk transactions; faster fund release on trusted sellers
- **For Sellers**: Improved liquidity on low-risk transactions; incentive to build reputation
- **For Arbiters**: Clear, data-driven decision support
- **For the Industry**: Proof that escrow can be both adaptive and decentralized

### Technical Achievements

1. **Mathematical Rigor**: Provably bounded risk scores; transparent formulas
2. **Scalability**: Serverless architecture scales to millions of transactions
3. **Security**: Multi-layer authentication + blockchain verification
4. **Integration**: Seamless blockchain + off-chain computation
5. **UX**: Clear, visual risk explanations for non-technical users

### Future Vision

This system could become a **standard escrow protocol** integrated into:
- E-commerce platforms (eBay, Shopify)
- Gig economy (Upwork, Fiverr)
- Peer-to-peer marketplaces (Craigslist 2.0)
- Cross-border trade
- High-value B2B transactions

By making escrow **adaptive, transparent, and fair**, we enable trustless commerce at scale.

---

## APPENDIX A: QUICK REFERENCE

### Key Endpoints

```
AUTH
POST   /auth/register         - Register with OTP
POST   /auth/login            - Login with email/password
POST   /auth/generate-otp     - Get OTP code

ESCROW
POST   /escrow/create         - Create new escrow
GET    /escrow/:id            - Get escrow details
GET    /escrow/list           - List all my escrows
POST   /escrow/:id/deliver    - Mark as delivered
POST   /escrow/:id/release    - Release funds

RISK
POST   /risk/compute          - Compute risk scores
GET    /risk/history          - Risk history

WALLET
GET    /wallet/balance        - Get current balance
POST   /wallet/deposit        - Deposit funds
POST   /wallet/withdraw       - Withdraw funds

DISPUTES
POST   /disputes/create       - Create dispute
GET    /disputes/:id          - Get dispute details
POST   /disputes/:id/resolve  - Resolve dispute (arbiter only)
```

### Common Error Responses

```json
// 401 Unauthorized
{ "error": "Invalid email or password" }

// 403 Forbidden
{ "error": "Invalid or expired token" }

// 400 Bad Request
{ "error": "Buyer and Seller cannot be the same" }

// 404 Not Found
{ "error": "Escrow not found" }

// 409 Conflict
{ "error": "An account with this email already exists" }

// 500 Internal Server Error
{ "error": "Internal server error", "details": "..." }
```

### Database Query Examples

```sql
-- Get all active escrows for a user
SELECT * FROM escrows 
WHERE (buyer_id = $1 OR seller_id = $1)
AND state IN ('created', 'delivered')
ORDER BY created_at DESC;

-- Get risk history for a user
SELECT * FROM suspicion_logs
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 10;

-- Calculate user reliability score
SELECT avg(reliability_score)
FROM reliability_history
WHERE user_id = $1
AND created_at >= CURRENT_DATE - INTERVAL '90 days';

-- Find all users with high suspicion
SELECT user_id, COUNT(*), AVG(risk_score)
FROM suspicion_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY user_id
HAVING AVG(risk_score) > 0.6
ORDER BY AVG(risk_score) DESC;
```

---

## END OF DOCUMENTATION

**Document Generated**: May 2, 2026
**Project**: Adaptive Risk-Based Escrow System
**Duration**: 8 weeks of active development
**Status**: Core features complete, beta testing phase
