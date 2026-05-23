class TokenWallet {
  final double balance;
  final double totalEarned;
  final double totalSpent;
  final String currency;
  final DateTime updatedAt;

  TokenWallet({
    required this.balance,
    required this.totalEarned,
    required this.totalSpent,
    required this.currency,
    required this.updatedAt,
  });

  factory TokenWallet.fromJson(Map<String, dynamic> json) {
    return TokenWallet(
      balance: (json['balance'] as num).toDouble(),
      totalEarned: (json['total_earned'] as num).toDouble(),
      totalSpent: (json['total_spent'] as num).toDouble(),
      currency: json['currency'] as String? ?? 'USD',
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }
}

class TokenTransaction {
  final int id;
  final String type; // 'purchase', 'gift', 'stream_earning', 'withdrawal'
  final double amount;
  final String description;
  final String status;
  final DateTime createdAt;

  TokenTransaction({
    required this.id,
    required this.type,
    required this.amount,
    required this.description,
    required this.status,
    required this.createdAt,
  });

  factory TokenTransaction.fromJson(Map<String, dynamic> json) {
    return TokenTransaction(
      id: json['id'] as int,
      type: json['type'] as String,
      amount: (json['amount'] as num).toDouble(),
      description: json['description'] as String,
      status: json['status'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }
}

class TokenPackage {
  final String name;
  final int tokens;
  final double price;
  final double discount; // Percentage

  TokenPackage({
    required this.name,
    required this.tokens,
    required this.price,
    required this.discount,
  });
}
