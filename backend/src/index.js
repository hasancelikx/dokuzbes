const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
require('dotenv').config();

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { PORT } = require('./config/constants');
const { initializeSocket } = require('./websocket/socket');
const { initializeRedis } = require('./websocket/redis');

const app = express();
const server = http.createServer(app);

// ==================== Middleware ====================
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== Routes ====================
app.use('/', routes);

// ==================== 404 Handler ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ==================== Error Handler ====================
app.use(errorHandler);

// ==================== Initialize Services ====================
const startServer = async () => {
  try {
    // Initialize Redis
    await initializeRedis();
    console.log('✅ Redis initialized');

    // Initialize Socket.io
    initializeSocket(server);
    console.log('✅ Socket.io initialized');

    // Start server
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`🔴 Live Streaming Ready`);
      console.log(`💰 Token System Ready`);
      console.log(`💬 Real-time Chat Ready`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
