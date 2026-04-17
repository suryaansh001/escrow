import { sql } from '../../src/config/db.js';
import { computeRiskScores, updateReliabilityScore } from '../risk/risk.services.js';
import walletService from '../users/wallet.service.js';
import { sendTransactionNotification } from '../../src/utils/email.js';

export async function createEscrow(req, res) {
    try {
        const userId = req.user.id;
        const { seller_id, counterparty_name, amount, description, transaction_type, adaptive_risk } = req.body;
        
        if (!amount) {
            return res.status(400).json({ error: 'Amount is required' });
        }

        let finalSellerId = seller_id;

        // If counterparty_name is provided, look up the seller user by full_name
        if (!seller_id && counterparty_name) {
            const sellerUser = await sql`SELECT id FROM users WHERE full_name = ${counterparty_name}`;
            if (sellerUser.length === 0) {
                return res.status(404).json({ error: 'Counterparty not found' });
            }
            finalSellerId = sellerUser[0].id;
        }
        
        if (!finalSellerId) {
            return res.status(400).json({ error: 'Seller ID or Counterparty name is required' });
        }
        
        if (userId === finalSellerId) {
            return res.status(400).json({ error: 'Buyer and Seller cannot be the same' });
        }

        if (amount <= 0) {
            return res.status(400).json({ error: 'Amount must be greater than 0' });
        }
        // Compute risk scores for the buyer
        const riskScores = await computeRiskScores(userId, parseFloat(amount));
        
        const newEscrow = await sql`
            INSERT INTO escrows (buyer_id, seller_id, amount, description, state, buyer_r_at_creation, suspicion_f_at_lock) 
            VALUES (${userId}, ${finalSellerId}, ${amount}, ${description || null}, 'created', 
                    (SELECT reliability_score FROM users WHERE id = ${userId}), ${riskScores.finalScore}) 
            RETURNING *
        `;
        
        if (newEscrow.length === 0) {
            return res.status(400).json({ error: 'Failed to create escrow' });
        }
        
        // Get buyer and seller details for email notifications
        const userDetails = await sql`
            SELECT 
                b.email as buyer_email, b.full_name as buyer_name,
                s.email as seller_email, s.full_name as seller_name
            FROM users b, users s 
            WHERE b.id = ${userId} AND s.id = ${finalSellerId}
        `;
        
        const buyerEmail = userDetails[0].buyer_email;
        const sellerEmail = userDetails[0].seller_email;
        const buyerName = userDetails[0].buyer_name;
        const sellerName = userDetails[0].seller_name;
        
        res.status(201).json({ 
            success: true,
            escrow: newEscrow[0],
            riskScores
        });

        // Send email notifications asynchronously (don't block response)
        try {
            // Notify buyer
            await sendTransactionNotification(buyerEmail, {
                id: newEscrow[0].id,
                amount: parseFloat(amount),
                counterparty: sellerName,
                status: 'Created',
                type: 'Escrow Created'
            });

            // Notify seller
            await sendTransactionNotification(sellerEmail, {
                id: newEscrow[0].id,
                amount: parseFloat(amount),
                counterparty: buyerName,
                status: 'Created',
                type: 'Escrow Invitation'
            });
        } catch (emailError) {
            console.error('Failed to send email notifications:', emailError);
            // Don't fail the transaction if email fails
        }
    } catch (error) {
        console.error('Error creating escrow:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}

export async function getEscrowById(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const escrowData = await sql`
            SELECT 
                e.*,
                b.email as buyer_email, b.full_name as buyer_name, b.reliability_score as buyer_reliability,
                s.email as seller_email, s.full_name as seller_name, s.reliability_score as seller_reliability
            FROM escrows e
            JOIN users b ON e.buyer_id = b.id
            JOIN users s ON e.seller_id = s.id
            WHERE e.id = ${id} AND (e.buyer_id = ${userId} OR e.seller_id = ${userId})
        `;
        
        if (escrowData.length === 0) {
            return res.status(404).json({ error: 'Escrow not found' });
        }
        
        const escrow = escrowData[0];
        
        res.status(200).json({ 
            success: true, 
            escrow: {
                ...escrow,
                buyer: {
                    id: escrow.buyer_id,
                    email: escrow.buyer_email,
                    full_name: escrow.buyer_name,
                    reliability_score: escrow.buyer_reliability
                },
                seller: {
                    id: escrow.seller_id,
                    email: escrow.seller_email,
                    full_name: escrow.seller_name,
                    reliability_score: escrow.seller_reliability
                }
            }
        });
    } catch (error) {
        console.error('Error fetching escrow:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getEscrowsByUserId(req, res) {
    try {
        const userId = req.user.id;
        
        const escrowsData = await sql`
            SELECT 
                e.*,
                b.email as buyer_email, b.full_name as buyer_name,
                s.email as seller_email, s.full_name as seller_name
            FROM escrows e
            JOIN users b ON e.buyer_id = b.id
            JOIN users s ON e.seller_id = s.id
            WHERE e.buyer_id = ${userId} OR e.seller_id = ${userId}
            ORDER BY e.created_at DESC
        `;
        
        const escrows = escrowsData.map(escrow => ({
            ...escrow,
            buyer: {
                id: escrow.buyer_id,
                email: escrow.buyer_email,
                full_name: escrow.buyer_name
            },
            seller: {
                id: escrow.seller_id,
                email: escrow.seller_email,
                full_name: escrow.seller_name
            }
        }));
        
        res.status(200).json({ success: true, escrows });
    } catch (error) {
        console.error('Error fetching escrows:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function updateEscrowState(req, res) {
    try {
        const { id } = req.params;
        const { state } = req.body;
        const userId = req.user.id;
        
        if (!state) {
            return res.status(400).json({ error: 'State is required' });
        }
        
        const validStates = ['created', 'funded', 'locked', 'released', 'disputed', 'cancelled'];
        if (!validStates.includes(state)) {
            return res.status(400).json({ error: 'Invalid state' });
        }
        
        const escrow = await sql`
            SELECT * FROM escrows 
            WHERE id = ${id} AND (buyer_id = ${userId} OR seller_id = ${userId})
        `;
        
        if (escrow.length === 0) {
            return res.status(404).json({ error: 'Escrow not found' });
        }
        
        const updatedEscrow = await sql`
            UPDATE escrows 
            SET state = ${state}, updated_at = NOW()
            WHERE id = ${id}
            RETURNING *
        `;
        
        res.status(200).json({ success: true, escrow: updatedEscrow[0] });
    } catch (error) {
        console.error('Error updating escrow state:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function fundEscrow(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Get escrow details
        const escrowData = await sql`
            SELECT * FROM escrows
            WHERE id = ${id} AND buyer_id = ${userId} AND state = 'created'
        `;

        if (escrowData.length === 0) {
            return res.status(404).json({ error: 'Escrow not found or not in created state' });
        }

        const escrow = escrowData[0];

        // Fund escrow from wallet
        const walletResult = await walletService.fundEscrow(userId, id, escrow.amount);

        // Update escrow state to funded
        const updatedEscrow = await sql`
            UPDATE escrows
            SET state = 'funded', funded_at = NOW(), updated_at = NOW()
            WHERE id = ${id}
            RETURNING *
        `;

        res.status(200).json({
            success: true,
            escrow: updatedEscrow[0],
            wallet: walletResult
        });
    } catch (error) {
        console.error('Error funding escrow:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}

async function updateScores(req, res) {
    try {
        const { user_id, reliability_score, kyc_status } = req.body;
        
        if (!user_id) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        const updatedUser = await sql`
            UPDATE users 
            SET reliability_score = ${reliability_score}, kyc_status = ${kyc_status} 
            WHERE id = ${user_id} 
            RETURNING id, email, full_name, reliability_score, kyc_status
        `;
        
        if (updatedUser.length === 0) {
            return res.status(400).json({ error: 'Failed to update user scores' });
        }
        
        res.status(200).json({ user: updatedUser[0] });
    } catch (error) {
        console.error('Error updating user scores:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


async function updateTransactionState(req, res) {
    try {
        const { escrow_id, new_state } = req.body;
        
        if (!escrow_id || !new_state) {
            return res.status(400).json({ error: 'Escrow ID and new state are required' });
        }
        
        const updatedEscrow = await sql`
            UPDATE escrows 
            SET state = ${new_state} 
            WHERE id = ${escrow_id} 
            RETURNING *
        `;
        
        if (updatedEscrow.length === 0) {
            return res.status(400).json({ error: 'Failed to update escrow state' });
        }
        
        res.status(200).json({ escrow: updatedEscrow[0] });
    } catch (error) {
        console.error('Error updating escrow state:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}



export default {
    createEscrow,
    updateScores,   
};