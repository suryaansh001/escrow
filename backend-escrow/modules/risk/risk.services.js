import { sql } from '../../src/config/db.js';

/**
 * Risk Scoring Service
 * Implements the new adaptive risk scoring system with Rolling, CUSUM, and Surge scores
 */

// Rolling Score: Z-score → Smooth Risk
function rollingScore(z) {
    // S_rolling = min(1, |Z| / 6)
    // Z_max = 6, beyond this it's basically insanity
    return Math.min(1, Math.abs(z) / 6);
}

// CUSUM Score: Drift Intensity
function cusumScore(S_t, h) {
    // S_CUSUM = min(1, S_t / h)
    return Math.min(1, S_t / h);
}

// Surge Score: Burst Behavior
function surgeScore(surge) {
    // S_Surge = min(1, Surge / 6)
    // T_max = 6
    return Math.min(1, surge / 6);
}

// Final Score: Weighted combination
function finalScore(z, S_t, h, surge) {
    const sRolling = rollingScore(z);
    const sCusum = cusumScore(S_t, h);
    const sSurge = surgeScore(surge);

    // Weights: Rolling: 0.4, CUSUM: 0.35, Surge: 0.25
    return 0.4 * sRolling + 0.35 * sCusum + 0.25 * sSurge;
}

// Risk Level Mapping
function getRiskLevel(finalScore) {
    if (finalScore <= 0.3) return 'normal';
    if (finalScore <= 0.55) return 'monitoring';
    if (finalScore <= 0.75) return 'partial_restriction';
    return 'immediate_freeze';
}

// Calculate Z-score for a user based on transaction amounts
async function calculateZScore(userId, currentAmount) {
    try {
        // Get user's transaction history (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const transactions = await sql`
            SELECT amount
            FROM transactions
            WHERE user_id = ${userId}
            AND created_at >= ${thirtyDaysAgo}
            AND type = 'escrow_lock'
            ORDER BY created_at DESC
        `;

        if (transactions.length === 0) {
            return 0; // No history, neutral score
        }

        const amounts = transactions.map(t => parseFloat(t.amount));
        const mean = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
        const variance = amounts.reduce((sum, amt) => sum + Math.pow(amt - mean, 2), 0) / amounts.length;
        const stdDev = Math.sqrt(variance);

        if (stdDev === 0) {
            return 0; // All transactions same amount
        }

        const zScore = (currentAmount - mean) / stdDev;
        return zScore;
    } catch (error) {
        console.error('Error calculating Z-score:', error);
        return 0;
    }
}

// Calculate CUSUM value for a user
async function calculateCusumValue(userId, currentAmount) {
    try {
        // Get or initialize CUSUM state
        let cusumState = await sql`
            SELECT s_pos, s_neg FROM cusum_state WHERE user_id = ${userId}
        `;

        let s_pos = 0;
        let s_neg = 0;

        if (cusumState.length > 0) {
            s_pos = parseFloat(cusumState[0].s_pos);
            s_neg = parseFloat(cusumState[0].s_neg);
        }

        // Get baseline statistics
        const baseline = await sql`
            SELECT AVG(amount) as mean, STDDEV(amount) as stddev
            FROM transactions
            WHERE user_id = ${userId}
            AND type = 'escrow_lock'
            AND created_at >= CURRENT_DATE - INTERVAL '90 days'
        `;

        if (baseline.length === 0 || !baseline[0].mean || !baseline[0].stddev) {
            return 0;
        }

        const mean = parseFloat(baseline[0].mean);
        const stddev = parseFloat(baseline[0].stddev);

        if (stddev === 0) {
            return 0;
        }

        // CUSUM parameters (configurable)
        const k = 0.5 * stddev; // k = 0.5 * sigma
        const h = 5 * stddev;   // h = 5 * sigma

        // Update CUSUM
        const x = currentAmount;
        const mu = mean + k; // Target mean + k

        s_pos = Math.max(0, s_pos + (x - mu));
        s_neg = Math.max(0, s_neg + (mu - x));

        // Save updated state
        await sql`
            INSERT INTO cusum_state (user_id, s_pos, s_neg, updated_at)
            VALUES (${userId}, ${s_pos}, ${s_neg}, NOW())
            ON CONFLICT (user_id) DO UPDATE SET
                s_pos = EXCLUDED.s_pos,
                s_neg = EXCLUDED.s_neg,
                updated_at = NOW()
        `;

        // Return the maximum CUSUM value
        return Math.max(s_pos, s_neg);
    } catch (error) {
        console.error('Error calculating CUSUM:', error);
        return 0;
    }
}

// Calculate surge ratio (current activity vs baseline)
async function calculateSurgeRatio(userId) {
    try {
        // Get transactions in last 24 hours
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const recentTxns = await sql`
            SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as volume
            FROM transactions
            WHERE user_id = ${userId}
            AND created_at >= ${oneDayAgo}
            AND type = 'escrow_lock'
        `;

        // Get average daily activity (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const baselineTxns = await sql`
            SELECT COUNT(*) as total_count, COALESCE(SUM(amount), 0) as total_volume
            FROM transactions
            WHERE user_id = ${userId}
            AND created_at >= ${thirtyDaysAgo}
            AND type = 'escrow_lock'
        `;

        const recentCount = parseInt(recentTxns[0].count);
        const baselineCount = parseInt(baselineTxns[0].total_count);

        if (baselineCount === 0) {
            return recentCount > 0 ? 1 : 0; // If no baseline, any activity is surge
        }

        const avgDailyCount = baselineCount / 30;
        const surgeRatio = recentCount / avgDailyCount;

        return surgeRatio;
    } catch (error) {
        console.error('Error calculating surge ratio:', error);
        return 0;
    }
}

// Main function to compute all risk scores for a transaction
export async function computeRiskScores(userId, transactionAmount, escrowId = null) {
    try {
        // Calculate individual scores
        const zScore = await calculateZScore(userId, transactionAmount);
        const cusumValue = await calculateCusumValue(userId, transactionAmount);
        const surgeRatio = await calculateSurgeRatio(userId);

        // Use default h value (configurable)
        const h = 5; // This should be configurable based on user history

        const computedFinalScore = finalScore(zScore, cusumValue, h, surgeRatio);
        const riskLevel = getRiskLevel(computedFinalScore);

        // Log the suspicion evaluation
        await sql`
            INSERT INTO suspicion_logs (
                user_id, transaction_id, z_score, cusum_value, surge_ratio,
                f_score, action, window_mean, window_stddev, avg_daily_txn, txn_24h_volume
            ) VALUES (
                ${userId}, ${escrowId}, ${zScore}, ${cusumValue}, ${surgeRatio},
                ${computedFinalScore}, ${riskLevel}::suspicion_action, 0, 0, 0, 0
            )
        `;

        return {
            zScore,
            cusumValue,
            surgeRatio,
            finalScore: computedFinalScore,
            riskLevel,
            rollingScore: rollingScore(zScore),
            cusumScore: cusumScore(cusumValue, h),
            surgeScore: surgeScore(surgeRatio)
        };
    } catch (error) {
        console.error('Error computing risk scores:', error);
        return {
            zScore: 0,
            cusumValue: 0,
            surgeRatio: 0,
            finalScore: 0,
            riskLevel: 'Normal',
            rollingScore: 0,
            cusumScore: 0,
            surgeScore: 0
        };
    }
}

// Update user reliability score based on transaction outcome
export async function updateReliabilityScore(userId, transactionSuccess = true, amount = 0) {
    try {
        // Get current reliability score
        const userData = await sql`
            SELECT reliability_score FROM users WHERE id = ${userId}
        `;

        if (userData.length === 0) {
            return;
        }

        let currentScore = parseFloat(userData[0].reliability_score);

        // Simple update logic (can be made more sophisticated)
        let newScore;
        if (transactionSuccess) {
            // Increase score for successful transactions
            newScore = Math.min(1, currentScore + 0.01);
        } else {
            // Decrease score for failed/problematic transactions
            newScore = Math.max(0, currentScore - 0.05);
        }

        // Update user score
        await sql`
            UPDATE users SET reliability_score = ${newScore}, updated_at = NOW()
            WHERE id = ${userId}
        `;

        // Log the change
        await sql`
            INSERT INTO reliability_history (
                user_id, r_previous, r_new, change_reason, alpha, beta
            ) VALUES (
                ${userId}, ${currentScore}, ${newScore},
                ${transactionSuccess ? 'txn_success' : 'anomaly_penalty'},
                ${transactionSuccess ? 0.01 : 0}, ${transactionSuccess ? 0 : 0.05}
            )
        `;

    } catch (error) {
        console.error('Error updating reliability score:', error);
    }
}

export default {
    computeRiskScores,
    updateReliabilityScore,
    rollingScore,
    cusumScore,
    surgeScore,
    finalScore,
    getRiskLevel
};

// Named exports for individual functions
export { rollingScore, cusumScore, surgeScore, finalScore, getRiskLevel };