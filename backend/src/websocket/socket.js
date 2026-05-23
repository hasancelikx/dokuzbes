const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');
const { getRedis } = require('./redis');
const { ChatMessageHandler } = require('./handlers/chatHandler');
const { StreamEventHandler } = require('./handlers/streamHandler');

let io = null;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No token provided'));

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`✅ User ${socket.userId} connected:`, socket.id);

    // Stream events
    socket.on('join_stream', (streamId) => StreamEventHandler.handleJoinStream(socket, streamId, io));
    socket.on('leave_stream', (streamId) => StreamEventHandler.handleLeaveStream(socket, streamId, io));
    socket.on('stream_live', (data) => StreamEventHandler.handleStreamLive(socket, data, io));
    socket.on('stream_ended', (streamId) => StreamEventHandler.handleStreamEnded(socket, streamId, io));

    // Chat events
    socket.on('send_message', (data) => ChatMessageHandler.handleMessage(socket, data, io));
    socket.on('send_gift', (data) => ChatMessageHandler.handleGift(socket, data, io));
    socket.on('like_stream', (streamId) => ChatMessageHandler.handleLike(socket, streamId, io));

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User ${socket.userId} disconnected`);
      StreamEventHandler.handleUserDisconnect(socket, io);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = {
  initializeSocket,
  getIO,
};
