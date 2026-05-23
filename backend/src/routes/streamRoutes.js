const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const streamController = require('../controllers/streamController');

/**
 * Stream Routes
 */

// Get active streams
router.get('/discover/active', streamController.getActiveStreams);

// Start stream
router.post('/start', verifyToken, streamController.startStream);

// Get stream details
router.get('/:streamId', streamController.getStream);

// Get creator's streams
router.get('/creator/:creatorId', streamController.getCreatorStreams);

// End stream
router.post('/:streamId/end', verifyToken, streamController.endStream);

module.exports = router;
