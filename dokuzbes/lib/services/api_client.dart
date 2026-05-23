import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:dokuzbes/config/app_config.dart';
import 'package:dokuzbes/utils/logger.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  String? _authToken;

  ApiClient._internal();

  factory ApiClient() {
    return _instance;
  }

  void setAuthToken(String token) {
    _authToken = token;
  }

  void clearAuthToken() {
    _authToken = null;
  }

  Map<String, String> _getHeaders({bool requireAuth = false}) {
    final headers = {
      'Content-Type': 'application/json',
    };

    if (requireAuth && _authToken != null) {
      headers['Authorization'] = 'Bearer $_authToken';
    }

    return headers;
  }

  Future<T> get<T>(
    String endpoint, {
    bool requireAuth = false,
    required T Function(Map<String, dynamic>) parser,
  }) async {
    try {
      final url = Uri.parse('$API_BASE_URL$endpoint');
      AppLogger.info('GET $endpoint');

      final response = await http.get(
        url,
        headers: _getHeaders(requireAuth: requireAuth),
      ).timeout(
        const Duration(seconds: API_TIMEOUT_SECONDS),
      );

      return _handleResponse(response, parser);
    } catch (e) {
      AppLogger.error('GET request error: $e');
      rethrow;
    }
  }

  Future<T> post<T>(
    String endpoint, {
    required Map<String, dynamic> body,
    bool requireAuth = false,
    required T Function(Map<String, dynamic>) parser,
  }) async {
    try {
      final url = Uri.parse('$API_BASE_URL$endpoint');
      AppLogger.info('POST $endpoint with body: $body');

      final response = await http.post(
        url,
        headers: _getHeaders(requireAuth: requireAuth),
        body: jsonEncode(body),
      ).timeout(
        const Duration(seconds: API_TIMEOUT_SECONDS),
      );

      return _handleResponse(response, parser);
    } catch (e) {
      AppLogger.error('POST request error: $e');
      rethrow;
    }
  }

  Future<T> put<T>(
    String endpoint, {
    required Map<String, dynamic> body,
    bool requireAuth = false,
    required T Function(Map<String, dynamic>) parser,
  }) async {
    try {
      final url = Uri.parse('$API_BASE_URL$endpoint');
      AppLogger.info('PUT $endpoint with body: $body');

      final response = await http.put(
        url,
        headers: _getHeaders(requireAuth: requireAuth),
        body: jsonEncode(body),
      ).timeout(
        const Duration(seconds: API_TIMEOUT_SECONDS),
      );

      return _handleResponse(response, parser);
    } catch (e) {
      AppLogger.error('PUT request error: $e');
      rethrow;
    }
  }

  Future<T> delete<T>(
    String endpoint, {
    bool requireAuth = false,
    required T Function(Map<String, dynamic>) parser,
  }) async {
    try {
      final url = Uri.parse('$API_BASE_URL$endpoint');
      AppLogger.info('DELETE $endpoint');

      final response = await http.delete(
        url,
        headers: _getHeaders(requireAuth: requireAuth),
      ).timeout(
        const Duration(seconds: API_TIMEOUT_SECONDS),
      );

      return _handleResponse(response, parser);
    } catch (e) {
      AppLogger.error('DELETE request error: $e');
      rethrow;
    }
  }

  T _handleResponse<T>(
    http.Response response,
    T Function(Map<String, dynamic>) parser,
  ) {
    AppLogger.info('Response status: ${response.statusCode}');

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final jsonData = jsonDecode(response.body) as Map<String, dynamic>;
      return parser(jsonData['data'] ?? jsonData);
    } else {
      final errorData = jsonDecode(response.body) as Map<String, dynamic>;
      final message = errorData['message'] ?? 'An error occurred';
      throw ApiException(response.statusCode, message);
    }
  }
}

class ApiException implements Exception {
  final int statusCode;
  final String message;

  ApiException(this.statusCode, this.message);

  @override
  String toString() => 'ApiException($statusCode): $message';
}
