class LiveStream {
  final int id;
  final int creatorId;
  final String title;
  final String? description;
  final String? coverImageUrl;
  final String category;
  final bool isLive;
  final int currentViewers;
  final int totalViewers;
  final double totalGiftsReceived;
  final String agoraToken;
  final String agoraChannelId;
  final String channelName;
  final DateTime? startedAt;
  final DateTime? endedAt;
  final Creator creator;

  LiveStream({
    required this.id,
    required this.creatorId,
    required this.title,
    this.description,
    this.coverImageUrl,
    required this.category,
    required this.isLive,
    required this.currentViewers,
    required this.totalViewers,
    required this.totalGiftsReceived,
    required this.agoraToken,
    required this.agoraChannelId,
    required this.channelName,
    this.startedAt,
    this.endedAt,
    required this.creator,
  });

  factory LiveStream.fromJson(Map<String, dynamic> json) {
    return LiveStream(
      id: json['id'] as int,
      creatorId: json['creator_id'] as int,
      title: json['title'] as String,
      description: json['description'] as String?,
      coverImageUrl: json['cover_image_url'] as String?,
      category: json['category'] as String? ?? 'other',
      isLive: json['is_live'] as bool,
      currentViewers: json['current_viewers'] as int? ?? 0,
      totalViewers: json['total_viewers'] as int? ?? 0,
      totalGiftsReceived: (json['total_gifts_received'] as num?)?.toDouble() ?? 0,
      agoraToken: json['agora_token'] as String,
      agoraChannelId: json['agora_channel_id'] as String,
      channelName: json['channel_name'] as String,
      startedAt: json['started_at'] != null ? DateTime.parse(json['started_at']) : null,
      endedAt: json['ended_at'] != null ? DateTime.parse(json['ended_at']) : null,
      creator: Creator.fromJson(json),
    );
  }
}

class Creator {
  final int id;
  final String username;
  final String? profileImageUrl;
  final bool verified;

  Creator({
    required this.id,
    required this.username,
    this.profileImageUrl,
    required this.verified,
  });

  factory Creator.fromJson(Map<String, dynamic> json) {
    return Creator(
      id: json['creator_id'] as int,
      username: json['username'] as String,
      profileImageUrl: json['profile_image_url'] as String?,
      verified: json['verified'] as bool? ?? false,
    );
  }
}

class LiveComment {
  final int id;
  final int userId;
  final String username;
  final String? userAvatar;
  final String message;
  final DateTime timestamp;

  LiveComment({
    required this.id,
    required this.userId,
    required this.username,
    this.userAvatar,
    required this.message,
    required this.timestamp,
  });
}

class StreamGift {
  final int id;
  final String name;
  final String? iconUrl;
  final int priceTokens;
  final String? animationUrl;
  final String rarity; // 'common', 'rare', 'epic', 'legendary'

  StreamGift({
    required this.id,
    required this.name,
    this.iconUrl,
    required this.priceTokens,
    this.animationUrl,
    required this.rarity,
  });

  factory StreamGift.fromJson(Map<String, dynamic> json) {
    return StreamGift(
      id: json['id'] as int,
      name: json['name'] as String,
      iconUrl: json['icon_url'] as String?,
      priceTokens: json['price_tokens'] as int,
      animationUrl: json['animation_url'] as String?,
      rarity: json['rarity'] as String? ?? 'common',
    );
  }
}
