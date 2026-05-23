import 'package:flutter/material.dart';
import 'package:dokuzbes/models/wallet_model.dart';
import 'package:dokuzbes/models/stream_model.dart';
import 'package:dokuzbes/services/stream_service.dart';

class WalletProvider with ChangeNotifier {
  final WalletService _walletService = WalletService();

  TokenWallet? _wallet;
  List<TokenTransaction> _transactions = [];
  List<StreamGift> _gifts = [];
  bool _isLoading = false;
  String? _error;

  TokenWallet? get wallet => _wallet;
  List<TokenTransaction> get transactions => _transactions;
  List<StreamGift> get gifts => _gifts;
  bool get isLoading => _isLoading;
  String? get error => _error;

  /// Fetch wallet balance
  Future<void> fetchBalance() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _wallet = await _walletService.getBalance();
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Fetch transaction history
  Future<void> fetchTransactions() async {
    try {
      _transactions = await _walletService.getTransactions();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Fetch available gifts
  Future<void> fetchGifts() async {
    try {
      _gifts = await _walletService.getGifts();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Purchase tokens
  Future<void> purchaseTokens({
    required int amount,
    required String packageName,
  }) async {
    try {
      await _walletService.purchaseTokens(
        amount: amount,
        packageName: packageName,
      );
      await fetchBalance();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }
}
