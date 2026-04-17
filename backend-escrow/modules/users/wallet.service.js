import db from '../db';
import { v4 as uuidv4 } from 'uuid';

class WalletService {
  /**
   * Get user wallet balance
   */
  async getBalance(userId) {
    const query = `
      SELECT wallet_balance, full_name, email
      FROM users
      WHERE id = $1
    `;
    const result = await db.query(query, [userId]);
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    return result.rows[0];
  }

  /**
   * Get wallet transaction history
   */
  async getTransactionHistory(userId, limit = 50, offset = 0) {
    const query = `
      SELECT
        wt.id,
        wt.transaction_type,
        wt.amount,
        wt.balance_before,
        wt.balance_after,
        wt.description,
        wt.status,
        wt.created_at,
        CASE
          WHEN wt.recipient_id IS NOT NULL THEN u.full_name
          ELSE NULL
        END as recipient_name,
        CASE
          WHEN wt.recipient_id IS NOT NULL THEN u.email
          ELSE NULL
        END as recipient_email
      FROM wallet_transactions wt
      LEFT JOIN users u ON wt.recipient_id = u.id
      WHERE wt.user_id = $1
      ORDER BY wt.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await db.query(query, [userId, limit, offset]);
    return result.rows;
  }

  /**
   * Deposit funds to wallet
   */
  async deposit(userId, amount, description = 'Deposit') {
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Get current balance
      const balanceQuery = 'SELECT wallet_balance FROM users WHERE id = $1 FOR UPDATE';
      const balanceResult = await client.query(balanceQuery, [userId]);
      if (balanceResult.rows.length === 0) {
        throw new Error('User not found');
      }
      const balanceBefore = parseFloat(balanceResult.rows[0].wallet_balance);

      // Update balance
      const newBalance = balanceBefore + amount;
      const updateQuery = 'UPDATE users SET wallet_balance = $1, updated_at = NOW() WHERE id = $2';
      await client.query(updateQuery, [newBalance, userId]);

      // Record transaction
      const transactionQuery = `
        INSERT INTO wallet_transactions (
          user_id, transaction_type, amount, balance_before, balance_after, description, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      await client.query(transactionQuery, [
        userId, 'deposit', amount, balanceBefore, newBalance, description, 'completed'
      ]);

      await client.query('COMMIT');
      return { balance: newBalance, transactionId: uuidv4() };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Withdraw funds from wallet
   */
  async withdraw(userId, amount, description = 'Withdrawal') {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Get current balance
      const balanceQuery = 'SELECT wallet_balance FROM users WHERE id = $1 FOR UPDATE';
      const balanceResult = await client.query(balanceQuery, [userId]);
      if (balanceResult.rows.length === 0) {
        throw new Error('User not found');
      }
      const balanceBefore = parseFloat(balanceResult.rows[0].wallet_balance);

      if (balanceBefore < amount) {
        throw new Error('Insufficient funds');
      }

      // Update balance
      const newBalance = balanceBefore - amount;
      const updateQuery = 'UPDATE users SET wallet_balance = $1, updated_at = NOW() WHERE id = $2';
      await client.query(updateQuery, [newBalance, userId]);

      // Record transaction
      const transactionQuery = `
        INSERT INTO wallet_transactions (
          user_id, transaction_type, amount, balance_before, balance_after, description, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      await client.query(transactionQuery, [
        userId, 'withdrawal', amount, balanceBefore, newBalance, description, 'completed'
      ]);

      await client.query('COMMIT');
      return { balance: newBalance, transactionId: uuidv4() };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Transfer funds between users
   */
  async transfer(fromUserId, toUserId, amount, description = 'Transfer') {
    if (amount <= 0) {
      throw new Error('Transfer amount must be positive');
    }
    if (fromUserId === toUserId) {
      throw new Error('Cannot transfer to yourself');
    }

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Lock both user balances
      const balanceQuery = `
        SELECT id, wallet_balance, full_name
        FROM users
        WHERE id IN ($1, $2)
        ORDER BY id
        FOR UPDATE
      `;
      const balanceResult = await client.query(balanceQuery, [fromUserId, toUserId]);
      if (balanceResult.rows.length !== 2) {
        throw new Error('One or both users not found');
      }

      const fromUser = balanceResult.rows.find(u => u.id === fromUserId);
      const toUser = balanceResult.rows.find(u => u.id === toUserId);

      const fromBalanceBefore = parseFloat(fromUser.wallet_balance);
      const toBalanceBefore = parseFloat(toUser.wallet_balance);

      if (fromBalanceBefore < amount) {
        throw new Error('Insufficient funds');
      }

      // Update balances
      const fromNewBalance = fromBalanceBefore - amount;
      const toNewBalance = toBalanceBefore + amount;

      const updateQuery = 'UPDATE users SET wallet_balance = $1, updated_at = NOW() WHERE id = $2';
      await client.query(updateQuery, [fromNewBalance, fromUserId]);
      await client.query(updateQuery, [toNewBalance, toUserId]);

      // Record transactions for both users
      const transactionQuery = `
        INSERT INTO wallet_transactions (
          user_id, transaction_type, amount, balance_before, balance_after, recipient_id, description, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;

      // Sender transaction
      await client.query(transactionQuery, [
        fromUserId, 'transfer_sent', amount, fromBalanceBefore, fromNewBalance,
        toUserId, description, 'completed'
      ]);

      // Receiver transaction
      await client.query(transactionQuery, [
        toUserId, 'transfer_received', amount, toBalanceBefore, toNewBalance,
        fromUserId, description, 'completed'
      ]);

      await client.query('COMMIT');
      return {
        fromBalance: fromNewBalance,
        toBalance: toNewBalance,
        transactionId: uuidv4()
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Fund escrow from wallet
   */
  async fundEscrow(userId, escrowId, amount) {
    if (amount <= 0) {
      throw new Error('Funding amount must be positive');
    }

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Get current balance
      const balanceQuery = 'SELECT wallet_balance FROM users WHERE id = $1 FOR UPDATE';
      const balanceResult = await client.query(balanceQuery, [userId]);
      if (balanceResult.rows.length === 0) {
        throw new Error('User not found');
      }
      const balanceBefore = parseFloat(balanceResult.rows[0].wallet_balance);

      if (balanceBefore < amount) {
        throw new Error('Insufficient funds');
      }

      // Update balance
      const newBalance = balanceBefore - amount;
      const updateQuery = 'UPDATE users SET wallet_balance = $1, updated_at = NOW() WHERE id = $2';
      await client.query(updateQuery, [newBalance, userId]);

      // Record transaction
      const transactionQuery = `
        INSERT INTO wallet_transactions (
          user_id, transaction_type, amount, balance_before, balance_after, escrow_id, description, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      await client.query(transactionQuery, [
        userId, 'escrow_funded', amount, balanceBefore, newBalance,
        escrowId, `Funded escrow ${escrowId}`, 'completed'
      ]);

      await client.query('COMMIT');
      return { balance: newBalance, transactionId: uuidv4() };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Release escrow funds to recipient
   */
  async releaseEscrowFunds(escrowId, recipientId, amount) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Get recipient balance
      const balanceQuery = 'SELECT wallet_balance FROM users WHERE id = $1 FOR UPDATE';
      const balanceResult = await client.query(balanceQuery, [recipientId]);
      if (balanceResult.rows.length === 0) {
        throw new Error('Recipient not found');
      }
      const balanceBefore = parseFloat(balanceResult.rows[0].wallet_balance);

      // Update recipient balance
      const newBalance = balanceBefore + amount;
      const updateQuery = 'UPDATE users SET wallet_balance = $1, updated_at = NOW() WHERE id = $2';
      await client.query(updateQuery, [newBalance, recipientId]);

      // Record transaction
      const transactionQuery = `
        INSERT INTO wallet_transactions (
          user_id, transaction_type, amount, balance_before, balance_after, escrow_id, description, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      await client.query(transactionQuery, [
        recipientId, 'escrow_released', amount, balanceBefore, newBalance,
        escrowId, `Escrow funds released ${escrowId}`, 'completed'
      ]);

      await client.query('COMMIT');
      return { balance: newBalance, transactionId: uuidv4() };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Refund escrow funds to buyer
   */
  async refundEscrowFunds(escrowId, buyerId, amount) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Get buyer balance
      const balanceQuery = 'SELECT wallet_balance FROM users WHERE id = $1 FOR UPDATE';
      const balanceResult = await client.query(balanceQuery, [buyerId]);
      if (balanceResult.rows.length === 0) {
        throw new Error('Buyer not found');
      }
      const balanceBefore = parseFloat(balanceResult.rows[0].wallet_balance);

      // Update buyer balance
      const newBalance = balanceBefore + amount;
      const updateQuery = 'UPDATE users SET wallet_balance = $1, updated_at = NOW() WHERE id = $2';
      await client.query(updateQuery, [newBalance, buyerId]);

      // Record transaction
      const transactionQuery = `
        INSERT INTO wallet_transactions (
          user_id, transaction_type, amount, balance_before, balance_after, escrow_id, description, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      await client.query(transactionQuery, [
        buyerId, 'escrow_refunded', amount, balanceBefore, newBalance,
        escrowId, `Escrow funds refunded ${escrowId}`, 'completed'
      ]);

      await client.query('COMMIT');
      return { balance: newBalance, transactionId: uuidv4() };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default new WalletService();