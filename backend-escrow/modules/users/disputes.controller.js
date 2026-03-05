import { sql } from '../../src/config/db.js';

export async function createDispute(req, res) {
    try {
        const { escrow_id, reason, evidence_urls } = req.body;
        const userId = req.user.id;
        
        if (!escrow_id || !reason) {
            return res.status(400).json({ error: 'Escrow ID and reason are required' });
        }
        
        // Fetch the escrow to validate user involvement
        const escrowData = await sql`SELECT buyer_id, seller_id FROM escrows WHERE id = ${escrow_id}`;
        
        if (escrowData.length === 0) {
            return res.status(404).json({ error: 'Escrow not found' });
        }
        
        const escrow = escrowData[0];
        
        if (userId !== escrow.buyer_id && userId !== escrow.seller_id) {
            return res.status(403).json({ error: 'You are not a party to this escrow' });
        }
        
        const againstUserId = (userId === escrow.buyer_id) ? escrow.seller_id : escrow.buyer_id;
        
        const newDispute = await sql`
            INSERT INTO disputes (escrow_id, raised_by, against, reason, evidence_urls, status) 
            VALUES (${escrow_id}, ${userId}, ${againstUserId}, ${reason}, ${evidence_urls || null}, 'open') 
            RETURNING *
        `;
        
        if (newDispute.length === 0) {
            return res.status(400).json({ error: 'Failed to create dispute' });
        }
        
        // Update escrow state to 'disputed'
        await sql`UPDATE escrows SET state = 'disputed' WHERE id = ${escrow_id}`;
        
        res.status(201).json({ success: true, dispute: newDispute[0] });
    } catch (error) {
        console.error('Error creating dispute:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}

export async function getDisputeById(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const dispute = await sql`
            SELECT d.* FROM disputes d
            WHERE d.id = ${id} AND (d.raised_by = ${userId} OR d.against = ${userId})
        `;
        
        if (dispute.length === 0) {
            return res.status(404).json({ error: 'Dispute not found' });
        }
        
        res.status(200).json({ success: true, dispute: dispute[0] });
    } catch (error) {
        console.error('Error fetching dispute:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getDisputesByUserId(req, res) {
    try {
        const userId = req.user.id;
        
        const disputes = await sql`
            SELECT * FROM disputes 
            WHERE raised_by = ${userId} OR against = ${userId}
            ORDER BY created_at DESC
        `;
        
        res.status(200).json({ success: true, disputes });
    } catch (error) {
        console.error('Error fetching disputes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function resolveDispute(req, res) {
    try {
        const { id } = req.params;
        const { resolved_in_favor_of, resolution_notes } = req.body;
        const userId = req.user.id;
        
        // Check if user is a resolver (admin) - for now allow the parties to resolve
        const dispute = await sql`
            SELECT * FROM disputes WHERE id = ${id}
        `;
        
        if (dispute.length === 0) {
            return res.status(404).json({ error: 'Dispute not found' });
        }
        
        const updatedDispute = await sql`
            UPDATE disputes 
            SET status = 'resolved', resolved_in_favor_of = ${resolved_in_favor_of}, 
                resolution_notes = ${resolution_notes || null}, resolved_at = NOW()
            WHERE id = ${id}
            RETURNING *
        `;
        
        // Update escrow state to 'released'
        if (updatedDispute.length > 0) {
            await sql`UPDATE escrows SET state = 'released' WHERE id = ${updatedDispute[0].escrow_id}`;
        }
        
        res.status(200).json({ success: true, dispute: updatedDispute[0] });
    } catch (error) {
        console.error('Error resolving dispute:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
