const pool = require('../config/database');
const AgoraService = require('../streaming/agoraService');
const { sendSuccess, sendError } = require('../utils/response');
const { STATUS_CODES } = require('../config/constants');

/**
 * @route GET /api/streams/start
 * @desc Start a new live stream
 */
exports.startStream = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const creatorId = req.user.id;

    // Check if user is creator
    const userQuery = 'SELECT is_creator FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [creatorId]);
    const user = userResult.rows[0];

    if (!user?.is_creator) {
      return sendError(res, 'Only creators can start streams', STATUS_CODES.FORBIDDEN);
    }

    // Generate unique channel name
    const channelName = `stream_${creatorId}_${Date.now()}`;
    const agoraToken = AgoraService.generateToken(channelName, creatorId);

    // Create stream record
    const streamQuery = `
      INSERT INTO live_streams (creator_id, channel_name, title, description, category, agora_token, agora_channel_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, channel_name, agora_token;
    `;

    const streamResult = await pool.query(streamQuery, [
      creatorId,
      channelName,
      title,
      description,
      category,
      agoraToken,
      channelName,
    ]);

    const stream = streamResult.rows[0];

    sendSuccess(
      res,
      {
        streamId: stream.id,
        channelName: stream.channel_name,
        agoraToken: stream.agora_token,
        agoraAppId: process.env.AGORA_APP_ID,
      },
      'Stream created successfully',
      STATUS_CODES.CREATED
    );
  } catch (error) {
    console.error('Error starting stream:', error);
    sendError(res, 'Failed to start stream', STATUS_CODES.INTERNAL_ERROR, error);
  }
};

/**
 * @route GET /api/streams/:streamId
 * @desc Get stream details
 */
exports.getStream = async (req, res) => {
  try {
    const { streamId } = req.params;

    const query = `
      SELECT 
        s.id,
        s.creator_id,
        s.title,
        s.description,
        s.category,
        s.is_live,
        s.current_viewers,
        s.total_viewers,
        s.total_gifts_received,
        s.agora_token,
        s.agora_channel_id,
        u.username,
        u.profile_image_url,
        u.verified
      FROM live_streams s
      JOIN users u ON s.creator_id = u.id
      WHERE s.id = $1;
    `;

    const result = await pool.query(query, [streamId]);

    if (result.rows.length === 0) {
      return sendError(res, 'Stream not found', STATUS_CODES.NOT_FOUND);
    }

    const stream = result.rows[0];

    // Generate viewer token
    const viewerToken = AgoraService.generateViewerToken(stream.agora_channel_id, req.user.id);

    sendSuccess(res, {
      ...stream,
      viewerToken,
    });
  } catch (error) {
    console.error('Error fetching stream:', error);
    sendError(res, 'Failed to fetch stream', STATUS_CODES.INTERNAL_ERROR, error);
  }
};

/**
 * @route GET /api/streams/discover/active
 * @desc Get active live streams
 */
exports.getActiveStreams = async (req, res) => {
  try {
    const query = `
      SELECT 
        s.id,
        s.creator_id,
        s.title,
        s.category,
        s.current_viewers,
        s.cover_image_url,
        u.username,
        u.profile_image_url,
        u.verified
      FROM live_streams s
      JOIN users u ON s.creator_id = u.id
      WHERE s.is_live = true
      ORDER BY s.current_viewers DESC
      LIMIT 50;
    `;

    const result = await pool.query(query);

    sendSuccess(res, result.rows);
  } catch (error) {
    console.error('Error fetching active streams:', error);
    sendError(res, 'Failed to fetch streams', STATUS_CODES.INTERNAL_ERROR, error);
  }
};

/**
 * @route POST /api/streams/:streamId/end
 * @desc End a live stream
 */
exports.endStream = async (req, res) => {
  try {
    const { streamId } = req.params;
    const creatorId = req.user.id;

    const query = `
      UPDATE live_streams
      SET is_live = false, ended_at = NOW()
      WHERE id = $1 AND creator_id = $2
      RETURNING id;
    `;

    const result = await pool.query(query, [streamId, creatorId]);

    if (result.rows.length === 0) {
      return sendError(res, 'Stream not found or unauthorized', STATUS_CODES.NOT_FOUND);
    }

    sendSuccess(res, null, 'Stream ended successfully');
  } catch (error) {
    console.error('Error ending stream:', error);
    sendError(res, 'Failed to end stream', STATUS_CODES.INTERNAL_ERROR, error);
  }
};

/**
 * @route GET /api/streams/creator/:creatorId
 * @desc Get creator's stream history
 */
exports.getCreatorStreams = async (req, res) => {
  try {
    const { creatorId } = req.params;
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;

    const query = `
      SELECT 
        id,
        title,
        description,
        category,
        is_live,
        current_viewers,
        total_viewers,
        total_gifts_received,
        started_at,
        ended_at
      FROM live_streams
      WHERE creator_id = $1
      ORDER BY started_at DESC
      LIMIT $2 OFFSET $3;
    `;

    const result = await pool.query(query, [creatorId, limit, offset]);

    sendSuccess(res, result.rows);
  } catch (error) {
    console.error('Error fetching creator streams:', error);
    sendError(res, 'Failed to fetch streams', STATUS_CODES.INTERNAL_ERROR, error);
  }
};
