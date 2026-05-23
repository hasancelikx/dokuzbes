const express = require('express');

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// API routes
router.use('/api/auth', require('./authRoutes'));
router.use('/api/users', require('./userRoutes'));
router.use('/api/streams', require('./streamRoutes'));
router.use('/api/wallet', require('./tokenRoutes'));

module.exports = router;
