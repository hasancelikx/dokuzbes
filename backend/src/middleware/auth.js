const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response');
const { JWT_SECRET, STATUS_CODES } = require('../config/constants');

/**
 * Verify JWT Token Middleware
 */
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return sendError(res, 'No token provided', STATUS_CODES.UNAUTHORIZED);
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    sendError(res, 'Invalid token', STATUS_CODES.UNAUTHORIZED, error);
  }
};

module.exports = {
  verifyToken,
};
