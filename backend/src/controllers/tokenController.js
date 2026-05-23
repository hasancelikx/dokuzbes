const pool = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');
const { STATUS_CODES } = require('../config/constants');

/**
 * @route GET /api/wallet/balance
 * @desc Get user token balance
 */
exports.getBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        balance,
        total_earned,
        total_spent,
        currency,
        updated_at
      FROM token_wallets
      WHERE user_id = $1;
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      // Create default wallet
      await pool.query(
        `INSERT INTO token_wallets (user_id, balance, total_earned, total_spent)
         VALUES ($1, 0, 0, 0)`,
        [userId]
      );

      return sendSuccess(res, {
        balance: 0,
        total_earned: 0,
        total_spent: 0,
        currency: 'USD',
      });
    }

    sendSuccess(res, result.rows[0]);
  } catch (error) {
    console.error('Error fetching balance:', error);
    sendError(res, 'Failed to fetch balance', STATUS_CODES.INTERNAL_ERROR, error);
  }
};

/**
 * @route GET /api/wallet/transactions
 * @desc Get transaction history
 */
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = req.query.limit || 50;
    const offset = req.query.offset || 0;

    const query = `
      SELECT 
        id,
        type,
        amount,
        description,
        status,
        created_at
      FROM token_transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3;
    `;

    const result = await pool.query(query, [userId, limit, offset]);

    sendSuccess(res, result.rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    sendError(res, 'Failed to fetch transactions', STATUS_CODES.INTERNAL_ERROR, error);
  }
};

/**
 * @route POST /api/wallet/purchase
 * @desc Create token purchase
 */
exports.purchaseTokens = async (req, res) => {
  try {
    const { amount, packageName } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return sendError(res, 'Invalid amount', STATUS_CODES.BAD_REQUEST);
    }

    // Create transaction record
    const transactionQuery = `
      INSERT INTO token_transactions (user_id, type, amount, description, status)
      VALUES ($1, 'purchase', $2, $3, 'pending')
      RETURNING id;
    `;

    const transactionResult = await pool.query(transactionQuery, [
      userId,
      amount,
      `Token Purchase - ${packageName}`,
    ]);

    // In production, this would create a Stripe payment intent
    sendSuccess(
      res,
      {
        transactionId: transactionResult.rows[0].id,
        amount,
        packageName,
        status: 'pending',
      },
      'Purchase initiated',
      STATUS_CODES.CREATED
    );
  } catch (error) {
    console.error('Error processing purchase:', error);
    sendError(res, 'Failed to process purchase', STATUS_CODES.INTERNAL_ERROR, error);
  }
};

/**
 * @route GET /api/wallet/gifts
 * @desc Get available gifts
 */
exports.getGifts = async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        name,
        icon_url,
        price_tokens,
        animation_url,
        rarity
      FROM gifts
      WHERE is_active = true
      ORDER BY price_tokens ASC;
    `;

    const result = await pool.query(query);

    sendSuccess(res, result.rows);
  } catch (error) {
    console.error('Error fetching gifts:', error);
    sendError(res, 'Failed to fetch gifts', STATUS_CODES.INTERNAL_ERROR, error);
  }
};
