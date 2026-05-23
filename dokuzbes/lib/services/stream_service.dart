import 'package:dokuzbes/models/stream_model.dart';
import 'package:dokuzbes/models/wallet_model.dart';
import 'package:dokuzbes/services/api_client.dart';
import 'package:dokuzbes/utils/logger.dart';

class StreamService {
  final ApiClient _apiClient = ApiClient();

  /// Get active live streams
  Future<List<LiveStream>> getActiveStreams() async {
    try {
      AppLogger.info('Fetching active streams...');

      final streams = await _apiClient.get(
        '/api/streams/discover/active',
        requireAuth: false,
        parser: (json) {
          final list = json is List ? json : [json];
          return (list as List)
              .map((stream) => LiveStream.fromJson(stream))
              .toList();
        },
      );

      AppLogger.info('Fetched ${streams.length} active streams');
      return streams;
    } catch (e) {
      AppLogger.error('Error fetching active streams: $e');
      rethrow;
    }
  }

  /// Get stream details
  Future<LiveStream> getStream(int streamId) async {
    try {
      AppLogger.info('Fetching stream $streamId...');

      return _apiClient.get(
        '/api/streams/$streamId',
        requireAuth: false,
        parser: (json) => LiveStream.fromJson(json),
      );
    } catch (e) {
      AppLogger.error('Error fetching stream: $e');
      rethrow;
    }
  }

  /// Start new stream
  Future<Map<String, dynamic>> startStream({
    required String title,
    required String description,
    required String category,
  }) async {
    try {
      AppLogger.info('Starting stream: $title');

      return _apiClient.post(
        '/api/streams/start',
        body: {
          'title': title,
          'description': description,
          'category': category,
        },
        requireAuth: true,
        parser: (json) => json,
      );
    } catch (e) {
      AppLogger.error('Error starting stream: $e');
      rethrow;
    }
  }

  /// End stream
  Future<void> endStream(int streamId) async {
    try {
      AppLogger.info('Ending stream $streamId...');

      await _apiClient.post(
        '/api/streams/$streamId/end',
        body: {},
        requireAuth: true,
        parser: (_) => null,
      );

      AppLogger.info('Stream ended');
    } catch (e) {
      AppLogger.error('Error ending stream: $e');
      rethrow;
    }
  }

  /// Get creator's streams
  Future<List<LiveStream>> getCreatorStreams(int creatorId) async {
    try {
      AppLogger.info('Fetching streams for creator $creatorId...');

      final streams = await _apiClient.get(
        '/api/streams/creator/$creatorId',
        requireAuth: false,
        parser: (json) {
          final list = json is List ? json : [json];
          return (list as List)
              .map((stream) => LiveStream.fromJson(stream))
              .toList();
        },
      );

      return streams;
    } catch (e) {
      AppLogger.error('Error fetching creator streams: $e');
      rethrow;
    }
  }
}

class WalletService {
  final ApiClient _apiClient = ApiClient();

  /// Get wallet balance
  Future<TokenWallet> getBalance() async {
    try {
      AppLogger.info('Fetching wallet balance...');

      return _apiClient.get(
        '/api/wallet/balance',
        requireAuth: true,
        parser: (json) => TokenWallet.fromJson(json),
      );
    } catch (e) {
      AppLogger.error('Error fetching balance: $e');
      rethrow;
    }
  }

  /// Get transaction history
  Future<List<TokenTransaction>> getTransactions({
    int limit = 50,
    int offset = 0,
  }) async {
    try {
      AppLogger.info('Fetching transactions...');

      final transactions = await _apiClient.get(
        '/api/wallet/transactions?limit=$limit&offset=$offset',
        requireAuth: true,
        parser: (json) {
          final list = json is List ? json : [json];
          return (list as List)
              .map((tx) => TokenTransaction.fromJson(tx))
              .toList();
        },
      );

      return transactions;
    } catch (e) {
      AppLogger.error('Error fetching transactions: $e');
      rethrow;
    }
  }

  /// Purchase tokens
  Future<Map<String, dynamic>> purchaseTokens({
    required int amount,
    required String packageName,
  }) async {
    try {
      AppLogger.info('Purchasing $amount tokens...');

      return _apiClient.post(
        '/api/wallet/purchase',
        body: {
          'amount': amount,
          'packageName': packageName,
        },
        requireAuth: true,
        parser: (json) => json,
      );
    } catch (e) {
      AppLogger.error('Error purchasing tokens: $e');
      rethrow;
    }
  }

  /// Get available gifts
  Future<List<StreamGift>> getGifts() async {
    try {
      AppLogger.info('Fetching gifts...');

      final gifts = await _apiClient.get(
        '/api/wallet/gifts',
        requireAuth: false,
        parser: (json) {
          final list = json is List ? json : [json];
          return (list as List)
              .map((gift) => StreamGift.fromJson(gift))
              .toList();
        },
      );

      return gifts;
    } catch (e) {
      AppLogger.error('Error fetching gifts: $e');
      rethrow;
    }
  }
}
