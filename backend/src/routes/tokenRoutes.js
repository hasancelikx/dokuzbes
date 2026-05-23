const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const tokenController = require('../controllers/tokenController');

/**
 * Token/Wallet Routes
 */

// Get wallet balance
router.get('/balance', verifyToken, tokenController.getBalance);

// Get transaction history
router.get('/transactions', verifyToken, tokenController.getTransactions);

// Purchase tokens
router.post('/purchase', verifyToken, tokenController.purchaseTokens);

// Get available gifts
router.get('/gifts', tokenController.getGifts);

module.exports = router;
