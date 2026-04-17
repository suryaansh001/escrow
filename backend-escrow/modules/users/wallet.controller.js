import walletService from './wallet.service.js';

class WalletController {
  /**
   * Get user wallet balance
   */
  async getBalance(req, res) {
    try {
      const { userId } = req.params;
      const balance = await walletService.getBalance(userId);
      res.json({
        success: true,
        data: balance
      });
    } catch (error) {
      console.error('Get balance error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get wallet transaction history
   */
  async getTransactionHistory(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      const transactions = await walletService.getTransactionHistory(
        userId,
        parseInt(limit),
        parseInt(offset)
      );
      res.json({
        success: true,
        data: transactions
      });
    } catch (error) {
      console.error('Get transaction history error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Deposit funds
   */
  async deposit(req, res) {
    try {
      const { userId } = req.params;
      const { amount, description } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Valid deposit amount required'
        });
      }

      const result = await walletService.deposit(userId, parseFloat(amount), description);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Deposit error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Withdraw funds
   */
  async withdraw(req, res) {
    try {
      const { userId } = req.params;
      const { amount, description } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Valid withdrawal amount required'
        });
      }

      const result = await walletService.withdraw(userId, parseFloat(amount), description);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Withdrawal error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Transfer funds between users
   */
  async transfer(req, res) {
    try {
      const { fromUserId } = req.params;
      const { toUserId, amount, description } = req.body;

      if (!toUserId || !amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Valid recipient and amount required'
        });
      }

      const result = await walletService.transfer(fromUserId, toUserId, parseFloat(amount), description);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Transfer error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Fund escrow from wallet
   */
  async fundEscrow(req, res) {
    try {
      const { userId } = req.params;
      const { escrowId, amount } = req.body;

      if (!escrowId || !amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Valid escrow ID and amount required'
        });
      }

      const result = await walletService.fundEscrow(userId, escrowId, parseFloat(amount));
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Fund escrow error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new WalletController();