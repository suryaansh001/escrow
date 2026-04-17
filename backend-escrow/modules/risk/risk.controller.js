import { computeRiskScores } from './risk.services.js';

export async function computeRisk(req, res) {
    try {
        const { user_id, amount } = req.body;

        if (!user_id || !amount) {
            return res.status(400).json({ error: 'User ID and amount are required' });
        }

        const riskScores = await computeRiskScores(user_id, parseFloat(amount));

        res.status(200).json({
            success: true,
            riskScores
        });
    } catch (error) {
        console.error('Error computing risk:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export default {
    computeRisk
};