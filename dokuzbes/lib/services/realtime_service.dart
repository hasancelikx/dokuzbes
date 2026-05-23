import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:dokuzbes/config/app_config.dart';
import 'package:dokuzbes/utils/logger.dart';

class RealtimeService {
  static final RealtimeService _instance = RealtimeService._internal();
  late IO.Socket socket;
  bool _isConnected = false;

  // Callbacks
  final List<Function(dynamic)> _messageCallbacks = [];
  final List<Function(dynamic)> _giftCallbacks = [];
  final List<Function(int)> _viewerCountCallbacks = [];
  final List<Function()> _connectionCallbacks = [];

  RealtimeService._internal();

  factory RealtimeService() {
    return _instance;
  }

  bool get isConnected => _isConnected;

  /// Initialize WebSocket connection
  void connect(String token) {
    try {
      socket = IO.io(API_BASE_URL, {
        'transports': ['websocket', 'polling'],
        'auth': {'token': token},
      });

      socket.onConnect((_) {
        _isConnected = true;
        AppLogger.info('✅ Connected to real-time server');
        _notifyConnectionCallbacks();
      });

      socket.on('new_message', (data) {
        _notifyMessageCallbacks(data);
      });

      socket.on('new_gift', (data) {
        _notifyGiftCallbacks(data);
      });

      socket.on('viewer_count', (data) {
        int count = data['count'] ?? 0;
        _notifyViewerCountCallbacks(count);
      });

      socket.on('stream_liked', (data) {
        AppLogger.info('❤️ Stream liked');
      });

      socket.onDisconnect((_) {
        _isConnected = false;
        AppLogger.warning('❌ Disconnected from real-time server');
      });

      socket.onConnectError((data) {
        AppLogger.error('Connection error: $data');
      });
    } catch (e) {
      AppLogger.error('Error connecting to real-time server: $e');
    }
  }

  /// Disconnect WebSocket
  void disconnect() {
    if (socket.connected) {
      socket.disconnect();
      _isConnected = false;
    }
  }

  /// Join live stream
  void joinStream(int streamId) {
    socket.emit('join_stream', streamId);
    AppLogger.info('Joined stream: $streamId');
  }

  /// Leave live stream
  void leaveStream(int streamId) {
    socket.emit('leave_stream', streamId);
    AppLogger.info('Left stream: $streamId');
  }

  /// Send chat message
  void sendMessage(int streamId, String message) {
    socket.emit('send_message', {
      'streamId': streamId,
      'message': message,
    });
  }

  /// Send gift
  void sendGift(int streamId, int giftId, int quantity) {
    socket.emit('send_gift', {
      'streamId': streamId,
      'giftId': giftId,
      'quantity': quantity,
    });
  }

  /// Like stream
  void likeStream(int streamId) {
    socket.emit('like_stream', streamId);
  }

  /// Stream going live
  void streamLive(int streamId, String title) {
    socket.emit('stream_live', {
      'streamId': streamId,
      'title': title,
    });
  }

  /// Stream ended
  void streamEnded(int streamId) {
    socket.emit('stream_ended', streamId);
  }

  // Callback management
  void onMessage(Function(dynamic) callback) {
    _messageCallbacks.add(callback);
  }

  void onGift(Function(dynamic) callback) {
    _giftCallbacks.add(callback);
  }

  void onViewerCount(Function(int) callback) {
    _viewerCountCallbacks.add(callback);
  }

  void onConnectionChange(Function() callback) {
    _connectionCallbacks.add(callback);
  }

  void _notifyMessageCallbacks(dynamic data) {
    for (var callback in _messageCallbacks) {
      callback(data);
    }
  }

  void _notifyGiftCallbacks(dynamic data) {
    for (var callback in _giftCallbacks) {
      callback(data);
    }
  }

  void _notifyViewerCountCallbacks(int count) {
    for (var callback in _viewerCountCallbacks) {
      callback(count);
    }
  }

  void _notifyConnectionCallbacks() {
    for (var callback in _connectionCallbacks) {
      callback();
    }
  }
}
