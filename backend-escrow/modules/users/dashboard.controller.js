//fetch data from dashboard and return it to the user
import { sql } from '../../src/config/db.js';



async function getDashboardData(req, res) {
    try { 
        const userId = req.user.id;
        
        // Fetch user data
        const userData = await sql`SELECT id, email, full_name, kyc_status, bank_verified, reliability_score, status FROM users WHERE id = ${userId}`;
        
        if (userData.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const user = userData[0];
        
        // Fetch total transactions (as buyer or seller)
        const transactionCount = await sql`
            SELECT COUNT(*) as count FROM escrows 
            WHERE buyer_id = ${userId} OR seller_id = ${userId}
        `;
        const totalTransactions = transactionCount[0].count;
        
        // Fetch active escrows
        const activeEscrowsData = await sql`
            SELECT COUNT(*) as count FROM escrows 
            WHERE (buyer_id = ${userId} OR seller_id = ${userId}) 
            AND state IN ('funded', 'locked')
        `;
        const activeEscrows = activeEscrowsData[0].count;
        
        // Calculate wallet balance from escrows as buyer
        const walletData = await sql`
            SELECT COALESCE(SUM(amount), 0) as balance FROM escrows 
            WHERE buyer_id = ${userId} AND state = 'released'
        `;
        const walletBalance = walletData[0].balance || 0;
        
        // Calculate risk score (0-100 based on reliability score)
        const riskScore = Math.round((1 - user.reliability_score) * 100);
        
        // Determine risk level based on new mapping
        const getRiskLevel = (score) => {
            const finalScore = score / 100; // Convert to 0-1 scale
            if (finalScore <= 0.3) return 'Normal';
            if (finalScore <= 0.55) return 'Monitor';
            if (finalScore <= 0.75) return 'Restrict';
            return 'Freeze';
        };
        
        const riskLevel = getRiskLevel(riskScore);
        
        // Fetch recent transactions
        const recentTransactions = await sql`
            SELECT 
                e.id,
                e.amount,
                e.state,
                e.created_at as createdAt,
                CASE 
                    WHEN e.buyer_id = ${userId} THEN u2.full_name
                    ELSE u1.full_name
                END as counterparty,
                CASE 
                    WHEN e.buyer_id = ${userId} THEN e.suspicion_f_at_lock
                    ELSE 0.0
                END as final_score
            FROM escrows e
            LEFT JOIN users u1 ON e.buyer_id = u1.id
            LEFT JOIN users u2 ON e.seller_id = u2.id
            WHERE e.buyer_id = ${userId} OR e.seller_id = ${userId}
            ORDER BY e.created_at DESC
            LIMIT 10
        `;
        
        const dashboardData = {
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                kyc_status: user.kyc_status,
                bank_verified: user.bank_verified,
                reliability_score: user.reliability_score,
                status: user.status
            },
            metrics: {
                totalTransactions: parseInt(totalTransactions),
                activeEscrows: parseInt(activeEscrows),
                walletBalance: parseFloat(walletBalance),
                riskScore: riskScore
            },
            riskProfile: {
                score: riskScore,
                level: riskLevel,
                description: `Your account has ${riskLevel.toLowerCase()} risk based on verified KYC and transaction history.`
            },
            recentTransactions: recentTransactions.map(tx => ({
                id: tx.id,
                counterparty: tx.counterparty,
                amount: parseFloat(tx.amount),
                state: tx.state,
                risk: getRiskLevel(tx.final_score * 100), // Convert back to 0-100 scale for display
                createdAt: tx.createdAt
            }))
        };
        
        return res.status(200).json({ success: true, data: dashboardData });
        
    } catch (error) {
        console.error('Dashboard data fetch error:', error);
        return res.status(500).json({ error: 'Failed to fetch dashboard data', details: error.message });
    }
}

async function getUserProfile(req, res) {
    try {
        const userId = req.user.id;

        const userData = await sql`SELECT id, email, full_name, phone, kyc_status, bank_verified, reliability_score, status, security_pin_hash FROM users WHERE id = ${userId}`;

        if (userData.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userData[0];

        return res.status(200).json({
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            phone: user.phone,
            kyc_status: user.kyc_status,
            bank_verified: user.bank_verified,
            reliability_score: user.reliability_score,
            status: user.status,
            security_pin: !!user.security_pin_hash // Boolean indicating if PIN is set
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export { getDashboardData, getUserProfile };

/**
 * GET /dashboard/decay-preview
 * Returns 90 data points showing how the user's reliability score
 * would decay over time if they were inactive.
 * Formula: R_t = R_0 * e^(-lambda * days)
 */
export async function getDecayPreview(req, res) {
    try {
        const userId = req.user.id;

        // Fetch current reliability score
        const userData = await sql`
            SELECT reliability_score FROM users WHERE id = ${userId}
        `;
        if (userData.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // If score is 0 (unverified user), use a demo value so graph is visible
        const rawScore = parseFloat(userData[0].reliability_score);
        const R0 = rawScore > 0 ? rawScore : 0.5; // 0.5 as demo for unverified users

        // Read lambda from system_config; fall back to 0.001 if not found
        let lambda = 0.001;
        try {
            const configRow = await sql`
                SELECT value FROM system_config WHERE key = 'decay_lambda'
            `;
            if (configRow.length > 0) {
                lambda = parseFloat(configRow[0].value);
            }
        } catch (_) {
            // system_config may not exist in all environments
        }

        // Generate 90 daily data points
        const DAYS = 90;
        const dataPoints = [];
        for (let day = 0; day <= DAYS; day++) {
            const R_t = R0 * Math.exp(-lambda * day);
            dataPoints.push({
                day,
                score: parseFloat(R_t.toFixed(6)),
                scorePercent: parseFloat((R_t * 100).toFixed(2)),
            });
        }

        // Compute some summary stats
        const halfLifeDays = Math.round(Math.log(2) / lambda);
        const scoreAt30 = R0 * Math.exp(-lambda * 30);
        const scoreAt60 = R0 * Math.exp(-lambda * 60);
        const scoreAt90 = R0 * Math.exp(-lambda * 90);

        return res.status(200).json({
            success: true,
            data: {
                currentScore: R0,
                currentScorePercent: parseFloat((R0 * 100).toFixed(2)),
                lambda,
                halfLifeDays,
                projections: {
                    day30: parseFloat((scoreAt30 * 100).toFixed(2)),
                    day60: parseFloat((scoreAt60 * 100).toFixed(2)),
                    day90: parseFloat((scoreAt90 * 100).toFixed(2)),
                },
                dataPoints,
            },
        });
    } catch (error) {
        console.error('Decay preview error:', error);
        return res.status(500).json({ error: 'Failed to compute decay preview', details: error.message });
    }
}

export async function listUsers(req, res) {
    try {
        const userId = req.user.id;
        const users = await sql`
            SELECT id, email, full_name, reliability_score, kyc_status FROM users 
            WHERE id != ${userId}
            ORDER BY full_name ASC
        `;
        return res.status(200).json({ success: true, users });
    } catch (error) {
        console.error('Error listing users:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}