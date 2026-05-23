const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_fake');
const pool = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');
const { STATUS_CODES } = require('../config/constants');

class PaymentService {
  /**
   * Create payment intent for token purchase
   */
  static async createPaymentIntent(userId, tokenAmount, tokenPackage) {
    try {
      // Get user
      const userQuery = 'SELECT email, first_name FROM users WHERE id = $1';
      const userResult = await pool.query(userQuery, [userId]);
      const user = userResult.rows[0];

      if (!user) throw new Error('User not found');

      // Calculate price in cents (1 token = $0.01 default)
      const amountInCents = Math.round(tokenAmount * 100 * 0.01);

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        metadata: {
          userId,
          tokenAmount,
          packageName: tokenPackage,
        },
        receipt_email: user.email,
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * Handle webhook - Payment succeeded
   */
  static async handlePaymentSuccess(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      const { userId, tokenAmount } = paymentIntent.metadata;

      // Credit tokens to user wallet
      const walletQuery = `
        UPDATE token_wallets
        SET balance = balance + $1, total_earned = total_earned + $1, updated_at = NOW()
        WHERE user_id = $2
        RETURNING balance;
      `;
      const walletResult = await pool.query(walletQuery, [tokenAmount, userId]);

      if (walletResult.rows.length === 0) {
        // Create wallet if doesn't exist
        await pool.query(
          `INSERT INTO token_wallets (user_id, balance, total_earned)
           VALUES ($1, $2, $2)`,
          [userId, tokenAmount]
        );
      }

      // Record transaction
      await pool.query(
        `INSERT INTO token_transactions (user_id, type, amount, description, reference_id, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, 'purchase', tokenAmount, `Token Purchase ${tokenAmount} tokens`, paymentIntentId, 'completed']
      );

      console.log(`✅ Payment successful: User ${userId} received ${tokenAmount} tokens`);
      return true;
    } catch (error) {
      console.error('Error handling payment success:', error);
      throw error;
    }
  }

  /**
   * Get payment history
   */
  static async getPaymentHistory(userId, limit = 50, offset = 0) {
    try {
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
      return result.rows;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }
}

module.exports = PaymentService;
