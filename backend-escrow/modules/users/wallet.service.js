import { sql } from '../../src/config/db.js';
import { v4 as uuidv4 } from 'uuid';

class WalletService {
  /**
   * Get user wallet balance
   */
  async getBalance(userId) {
    const result = await sql`
      SELECT wallet_balance, full_name, email
      FROM users
      WHERE id = ${userId}
    `;
    if (result.length === 0) {
      throw new Error('User not found');
    }
    return result[0];
  }

  /**
   * Get wallet transaction history
   */
  async getTransactionHistory(userId, limit = 50, offset = 0) {
    const result = await sql`
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
      WHERE wt.user_id = ${userId}
      ORDER BY wt.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return result;
  }

  /**
   * Deposit funds to wallet
   */
  async deposit(userId, amount, description = 'Deposit') {
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }

    return await sql.begin(async (sql) => {
      // Get current balance
      const balanceResult = await sql`
        SELECT wallet_balance FROM users WHERE id = ${userId} FOR UPDATE
      `;
      if (balanceResult.length === 0) {
        throw new Error('User not found');
      }
      const balanceBefore = parseFloat(balanceResult[0].wallet_balance);

      // Update balance
      const newBalance = balanceBefore + amount;
      await sql`
        UPDATE users SET wallet_balance = ${newBalance}, updated_at = NOW() WHERE id = ${userId}
      `;

      // Record transaction
      const transactionResult = await sql`
        INSERT INTO wallet_transactions (
          user_id, transaction_type, amount, balance_before, balance_after, description, status
        ) VALUES (${userId}, 'deposit', ${amount}, ${balanceBefore}, ${newBalance}, ${description}, 'completed')
        RETURNING id
      `;

      return { balance: newBalance, transactionId: transactionResult[0].id };
    });
  }

  /**
   * Withdraw funds from wallet
   */
  async withdraw(userId, amount, description = 'Withdrawal') {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }

    return await sql.begin(async (sql) => {
      // Get current balance
      const balanceResult = await sql`
        SELECT wallet_balance FROM users WHERE id = ${userId} FOR UPDATE
      `;
      if (balanceResult.length === 0) {
        throw new Error('User not found');
      }
      const balanceBefore = parseFloat(balanceResult[0].wallet_balance);

      if (balanceBefore < amount) {
        throw new Error('Insufficient funds');
      }

      // Update balance
      const newBalance = balanceBefore - amount;
      await sql`
        UPDATE users SET wallet_balance = ${newBalance}, updated_at = NOW() WHERE id = ${userId}
      `;

      // Record transaction
      const transactionResult = await sql`
        INSERT INTO wallet_transactions (
          user_id, transaction_type, amount, balance_before, balance_after, description, status
        ) VALUES (${userId}, 'withdrawal', ${amount}, ${balanceBefore}, ${newBalance}, ${description}, 'completed')
        RETURNING id
      `;

      return { balance: newBalance, transactionId: transactionResult[0].id };
    });
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

    return await sql.begin(async (sql) => {
      // Lock both user balances
      const balanceResult = await sql`
        SELECT id, wallet_balance, full_name
        FROM users
        WHERE id IN (${fromUserId}, ${toUserId})
        ORDER BY id
        FOR UPDATE
      `;
      if (balanceResult.length !== 2) {
        throw new Error('One or both users not found');
      }

      const fromUser = balanceResult.find(u => u.id === fromUserId);
      const toUser = balanceResult.find(u => u.id === toUserId);

      const fromBalanceBefore = parseFloat(fromUser.wallet_balance);
      const toBalanceBefore = parseFloat(toUser.wallet_balance);

      if (fromBalanceBefore < amount) {
        throw new Error('Insufficient funds');
      }

      // Update balances
      const fromNewBalance = fromBalanceBefore - amount;
      const toNewBalance = toBalanceBefore + amount;

      await sql`
        UPDATE users SET wallet_balance = ${fromNewBalance}, updated_at = NOW() WHERE id = ${fromUserId}
      `;
      await sql`
        UPDATE users SET wallet_balance = ${toNewBalance}, updated_at = NOW() WHERE id = ${toUserId}
      `;

      // Record transactions for both users
      const senderTransaction = await sql`
        INSERT INTO wallet_transactions (
          user_id, transaction_type, amount, balance_before, balance_after, recipient_id, description, status
        ) VALUES (${fromUserId}, 'transfer_sent', ${amount}, ${fromBalanceBefore}, ${fromNewBalance}, ${toUserId}, ${description}, 'completed')
        RETURNING id
      `;

      await sql`
        INSERT INTO wallet_transactions (
          user_id, transaction_type, amount, balance_before, balance_after, recipient_id, description, status
        ) VALUES (${toUserId}, 'transfer_received', ${amount}, ${toBalanceBefore}, ${toNewBalance}, ${fromUserId}, ${description}, 'completed')
      `;

      return {
        fromBalance: fromNewBalance,
        toBalance: toNewBalance,
        transactionId: senderTransaction[0].id
      };
    });
  }

  /**
   * Fund escrow from wallet
   */
  async fundEscrow(userId, escrowId, amount) {
    if (amount <= 0) {
      throw new Error('Funding amount must be positive');
    }

    return await sql.begin(async (sql) => {
      // Get current balance
      const balanceResult = await sql`
        SELECT wallet_balance FROM users WHERE id = ${userId} FOR UPDATE
      `;
      if (balanceResult.length === 0) {
        throw new Error('User not found');
      }
      const balanceBefore = parseFloat(balanceResult[0].wallet_balance);

      if (balanceBefore < amount) {
        throw new Error('Insufficient funds');
      }

      // Update balance
      const newBalance = balanceBefore - amount;
      await sql`
        UPDATE users SET wallet_balance = ${newBalance}, updated_at = NOW() WHERE id = ${userId}
      `;

      // Record transaction
      const transactionResult = await sql`
        INSERT INTO wallet_transactions (
          user_id, transaction_type, amount, balance_before, balance_after, escrow_id, description, status
        ) VALUES (${userId}, 'escrow_funded', ${amount}, ${balanceBefore}, ${newBalance}, ${escrowId}, ${`Funded escrow ${escrowId}`}, 'completed')
        RETURNING id
      `;

      return { balance: newBalance, transactionId: transactionResult[0].id };
    });
  }

  /**
   * Release escrow funds to recipient
   */
  async releaseEscrowFunds(escrowId, recipientId, amount) {
    return await sql.begin(async (sql) => {
      // Get recipient balance
      const balanceResult = await sql`
        SELECT wallet_balance FROM users WHERE id = ${recipientId} FOR UPDATE
      `;
      if (balanceResult.length === 0) {
        throw new Error('Recipient not found');
      }
      const balanceBefore = parseFloat(balanceResult[0].wallet_balance);

      // Update recipient balance
      const newBalance = balanceBefore + amount;
      await sql`
        UPDATE users SET wallet_balance = ${newBalance}, updated_at = NOW() WHERE id = ${recipientId}
      `;

      // Record transaction
      const transactionResult = await sql`
        INSERT INTO wallet_transactions (
          user_id, transaction_type, amount, balance_before, balance_after, escrow_id, description, status
        ) VALUES (${recipientId}, 'escrow_released', ${amount}, ${balanceBefore}, ${newBalance}, ${escrowId}, ${`Escrow funds released ${escrowId}`}, 'completed')
        RETURNING id
      `;

      return { balance: newBalance, transactionId: transactionResult[0].id };
    });
  }

  /**
   * Refund escrow funds to buyer
   */
  async refundEscrowFunds(escrowId, buyerId, amount) {
    return await sql.begin(async (sql) => {
      // Get buyer balance
      const balanceResult = await sql`
        SELECT wallet_balance FROM users WHERE id = ${buyerId} FOR UPDATE
      `;
      if (balanceResult.length === 0) {
        throw new Error('Buyer not found');
      }
      const balanceBefore = parseFloat(balanceResult[0].wallet_balance);

      // Update buyer balance
      const newBalance = balanceBefore + amount;
      await sql`
        UPDATE users SET wallet_balance = ${newBalance}, updated_at = NOW() WHERE id = ${buyerId}
      `;

      // Record transaction
      const transactionResult = await sql`
        INSERT INTO wallet_transactions (
          user_id, transaction_type, amount, balance_before, balance_after, escrow_id, description, status
        ) VALUES (${buyerId}, 'escrow_refunded', ${amount}, ${balanceBefore}, ${newBalance}, ${escrowId}, ${`Escrow funds refunded ${escrowId}`}, 'completed')
        RETURNING id
      `;

      return { balance: newBalance, transactionId: transactionResult[0].id };
    });
  }
}
}

export default new WalletService();