import 'package:flutter/material.dart';
import 'package:dokuzbes/models/stream_model.dart';
import 'package:dokuzbes/services/stream_service.dart';

class StreamProvider with ChangeNotifier {
  final StreamService _streamService = StreamService();

  List<LiveStream> _activeStreams = [];
  bool _isLoading = false;
  String? _error;

  List<LiveStream> get activeStreams => _activeStreams;
  bool get isLoading => _isLoading;
  String? get error => _error;

  /// Fetch active live streams
  Future<void> fetchActiveStreams() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _activeStreams = await _streamService.getActiveStreams();
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Start a new stream
  Future<Map<String, dynamic>> startStream({
    required String title,
    required String description,
    required String category,
  }) async {
    try {
      return await _streamService.startStream(
        title: title,
        description: description,
        category: category,
      );
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }
}
