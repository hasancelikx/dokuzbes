const pool = require('../../config/database');
const { cacheSet, cacheGet, cacheDel } = require('../redis');

class ChatMessageHandler {
  /**
   * Handle live chat messages
   */
  static async handleMessage(socket, { streamId, message }, io) {
    try {
      // Save to database
      const query = `
        INSERT INTO live_comments (stream_id, user_id, content)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, content, created_at;
      `;
      const result = await pool.query(query, [streamId, socket.userId, message]);
      const comment = result.rows[0];

      // Get user info for display
      const userQuery = 'SELECT id, username, profile_image_url FROM users WHERE id = $1';
      const userResult = await pool.query(userQuery, [socket.userId]);
      const user = userResult.rows[0];

      // Broadcast to stream room
      const messageData = {
        id: comment.id,
        user: {
          id: user.id,
          username: user.username,
          profileImage: user.profile_image_url,
        },
        message: comment.content,
        timestamp: comment.created_at,
      };

      io.to(`stream_${streamId}`).emit('new_message', messageData);
      console.log(`📨 Message in stream ${streamId}:`, message);
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  /**
   * Handle gift sending
   */
  static async handleGift(socket, { streamId, giftId, quantity }, io) {
    try {
      const client = require('stripe')(process.env.STRIPE_SECRET_KEY);

      // Get gift details
      const giftQuery = 'SELECT id, name, price_tokens, icon_url FROM gifts WHERE id = $1';
      const giftResult = await pool.query(giftQuery, [giftId]);
      const gift = giftResult.rows[0];

      if (!gift) {
        return socket.emit('error', { message: 'Gift not found' });
      }

      const totalTokens = gift.price_tokens * quantity;

      // Check user balance
      const walletQuery = 'SELECT balance FROM token_wallets WHERE user_id = $1';
      const walletResult = await pool.query(walletQuery, [socket.userId]);
      const wallet = walletResult.rows[0];

      if (!wallet || wallet.balance < totalTokens) {
        return socket.emit('error', { message: 'Insufficient tokens' });
      }

      // Deduct tokens
      await pool.query(
        'UPDATE token_wallets SET balance = balance - $1 WHERE user_id = $2',
        [totalTokens, socket.userId]
      );

      // Record transaction
      await pool.query(
        `INSERT INTO token_transactions (user_id, type, amount, description)
         VALUES ($1, $2, $3, $4)`,
        [socket.userId, 'gift', totalTokens, `Gift: ${gift.name} x${quantity}`]
      );

      // Record stream gift
      const giftRecordQuery = `
        INSERT INTO stream_gifts (stream_id, gift_id, sender_id, quantity, total_tokens_spent)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id;
      `;
      await pool.query(giftRecordQuery, [streamId, giftId, socket.userId, quantity, totalTokens]);

      // Get sender info
      const userQuery = 'SELECT id, username, profile_image_url FROM users WHERE id = $1';
      const userResult = await pool.query(userQuery, [socket.userId]);
      const user = userResult.rows[0];

      // Broadcast gift
      const giftData = {
        gift: {
          id: gift.id,
          name: gift.name,
          icon: gift.icon_url,
          quantity,
        },
        sender: {
          id: user.id,
          username: user.username,
          profileImage: user.profile_image_url,
        },
        totalTokens,
        timestamp: new Date(),
      };

      io.to(`stream_${streamId}`).emit('new_gift', giftData);
      console.log(`🎁 Gift sent: ${user.username} -> ${gift.name} x${quantity}`);
    } catch (error) {
      console.error('Error handling gift:', error);
      socket.emit('error', { message: 'Failed to send gift' });
    }
  }

  /**
   * Handle like
   */
  static async handleLike(socket, streamId, io) {
    try {
      // Increment like count in cache for real-time display
      const cacheKey = `stream_likes_${streamId}`;
      let likes = await cacheGet(cacheKey) || 0;
      likes++;
      await cacheSet(cacheKey, likes, 3600);

      io.to(`stream_${streamId}`).emit('stream_liked', {
        totalLikes: likes,
        userId: socket.userId,
      });
    } catch (error) {
      console.error('Error handling like:', error);
    }
  }
}

module.exports = {
  ChatMessageHandler,
};
