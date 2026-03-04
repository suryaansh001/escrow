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
        
        const walletData = await sql`
            SELECT COALESCE(SUM(amount), 0) as balance FROM wallet 
            WHERE user_id = ${userId}
        `;
        const walletBalance = walletData[0].balance || 0;
        
        // Calculate risk score (0-100 based on reliability score)
        const riskScore = Math.round((1 - user.reliability_score) * 100);
        
        // Determine risk level
        const getRiskLevel = (score) => {
            if (score <= 30) return 'Low';
            if (score <= 60) return 'Medium';
            return 'High';
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
                ROUND((1 - COALESCE(
                    CASE 
                        WHEN e.buyer_id = ${userId} THEN e.seller_r_at_creation
                        ELSE e.buyer_r_at_creation
                    END, 0.5)) * 100) as risk
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
                risk: getRiskLevel(parseInt(tx.risk)),
                createdAt: tx.createdAt
            }))
        };
        
        return res.status(200).json({ success: true, data: dashboardData });
        
    } catch (error) {
        console.error('Dashboard data fetch error:', error);
        return res.status(500).json({ error: 'Failed to fetch dashboard data', details: error.message });
    }
}

export { getDashboardData };