const pool = require('../../config/database');
const { cacheSet, cacheGet } = require('../redis');

class StreamEventHandler {
  /**
   * Handle user joining stream
   */
  static async handleJoinStream(socket, streamId, io) {
    try {
      socket.join(`stream_${streamId}`);

      // Update current viewers
      const viewerKey = `stream_viewers_${streamId}`;
      let viewers = await cacheGet(viewerKey) || [];

      if (!viewers.includes(socket.userId)) {
        viewers.push(socket.userId);
        await cacheSet(viewerKey, viewers);
      }

      // Record in database
      await pool.query(
        `INSERT INTO stream_viewers (stream_id, viewer_id, joined_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT DO NOTHING`,
        [streamId, socket.userId]
      );

      // Broadcast viewer count
      io.to(`stream_${streamId}`).emit('viewer_count', {
        count: viewers.length,
        timestamp: new Date(),
      });

      console.log(`👀 User ${socket.userId} joined stream ${streamId} (Total: ${viewers.length})`);
    } catch (error) {
      console.error('Error joining stream:', error);
      socket.emit('error', { message: 'Failed to join stream' });
    }
  }

  /**
   * Handle user leaving stream
   */
  static async handleLeaveStream(socket, streamId, io) {
    try {
      socket.leave(`stream_${streamId}`);

      // Update viewers cache
      const viewerKey = `stream_viewers_${streamId}`;
      let viewers = await cacheGet(viewerKey) || [];
      viewers = viewers.filter((id) => id !== socket.userId);
      await cacheSet(viewerKey, viewers);

      // Update database
      await pool.query(
        `UPDATE stream_viewers SET left_at = NOW()
         WHERE stream_id = $1 AND viewer_id = $2 AND left_at IS NULL`,
        [streamId, socket.userId]
      );

      io.to(`stream_${streamId}`).emit('viewer_count', {
        count: viewers.length,
        timestamp: new Date(),
      });

      console.log(`👋 User ${socket.userId} left stream ${streamId}`);
    } catch (error) {
      console.error('Error leaving stream:', error);
    }
  }

  /**
   * Handle stream going live
   */
  static async handleStreamLive(socket, { streamId, title }, io) {
    try {
      // Update stream status
      await pool.query(
        `UPDATE live_streams SET is_live = true, started_at = NOW()
         WHERE id = $1 AND creator_id = $2`,
        [streamId, socket.userId]
      );

      // Cache stream as live
      await cacheSet(`stream_live_${streamId}`, true, 86400);

      // Broadcast to all connected users
      io.emit('stream_started', {
        streamId,
        title,
        creatorId: socket.userId,
        timestamp: new Date(),
      });

      console.log(`🔴 Stream ${streamId} is LIVE`);
    } catch (error) {
      console.error('Error starting stream:', error);
      socket.emit('error', { message: 'Failed to start stream' });
    }
  }

  /**
   * Handle stream ending
   */
  static async handleStreamEnded(socket, streamId, io) {
    try {
      // Get stream analytics
      const analyticsQuery = `
        SELECT 
          COUNT(DISTINCT viewer_id) as total_viewers,
          COUNT(*) as total_entries
        FROM stream_viewers
        WHERE stream_id = $1
      `;
      const analyticsResult = await pool.query(analyticsQuery, [streamId]);
      const analytics = analyticsResult.rows[0];

      // Update stream
      await pool.query(
        `UPDATE live_streams SET is_live = false, ended_at = NOW(), total_viewers = $1
         WHERE id = $2`,
        [analytics.total_viewers, streamId]
      );

      // Remove from cache
      await pool.query(
        `DELETE FROM stream_viewers WHERE stream_id = $1`,
        [streamId]
      );

      io.emit('stream_ended', {
        streamId,
        totalViewers: analytics.total_viewers,
        timestamp: new Date(),
      });

      console.log(`🔵 Stream ${streamId} ended. Viewers: ${analytics.total_viewers}`);
    } catch (error) {
      console.error('Error ending stream:', error);
      socket.emit('error', { message: 'Failed to end stream' });
    }
  }

  /**
   * Handle user disconnect
   */
  static async handleUserDisconnect(socket, io) {
    // Automatically leave all streams
    const rooms = Array.from(socket.rooms);
    for (const room of rooms) {
      if (room.startsWith('stream_')) {
        const streamId = room.replace('stream_', '');
        this.handleLeaveStream(socket, streamId, io);
      }
    }
  }
}

module.exports = {
  StreamEventHandler,
};
