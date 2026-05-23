-- ==================== USERS EXTENSIONS ====================
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_creator BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_is_creator ON users(is_creator);

-- ==================== TOKEN WALLET SYSTEM ====================
CREATE TABLE IF NOT EXISTS token_wallets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  balance DECIMAL(18, 2) DEFAULT 0.00,
  total_earned DECIMAL(18, 2) DEFAULT 0.00,
  total_spent DECIMAL(18, 2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'USD',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_token_wallets_user_id ON token_wallets(user_id);

-- ==================== TOKEN TRANSACTIONS ====================
CREATE TABLE IF NOT EXISTS token_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL, -- 'purchase', 'gift', 'stream_earning', 'withdrawal'
  amount DECIMAL(18, 2) NOT NULL,
  description VARCHAR(255),
  reference_id VARCHAR(100), -- Stripe transaction ID, stream ID, etc
  status VARCHAR(20) DEFAULT 'completed', -- 'pending', 'completed', 'failed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_type ON token_transactions(type);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created_at ON token_transactions(created_at);

-- ==================== LIVE STREAMS ====================
CREATE TABLE IF NOT EXISTS live_streams (
  id SERIAL PRIMARY KEY,
  creator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel_name VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  category VARCHAR(100), -- 'games', 'music', 'talk', 'other'
  is_live BOOLEAN DEFAULT false,
  current_viewers INTEGER DEFAULT 0,
  total_viewers INTEGER DEFAULT 0,
  total_gifts_received DECIMAL(18, 2) DEFAULT 0,
  agora_token TEXT,
  agora_channel_id VARCHAR(255),
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_live_streams_creator_id ON live_streams(creator_id);
CREATE INDEX IF NOT EXISTS idx_live_streams_is_live ON live_streams(is_live);
CREATE INDEX IF NOT EXISTS idx_live_streams_category ON live_streams(category);
CREATE INDEX IF NOT EXISTS idx_live_streams_channel_name ON live_streams(channel_name);

-- ==================== STREAM VIEWERS ====================
CREATE TABLE IF NOT EXISTS stream_viewers (
  id SERIAL PRIMARY KEY,
  stream_id INTEGER NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  viewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP,
  watch_duration_seconds INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_stream_viewers_stream_id ON stream_viewers(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_viewers_viewer_id ON stream_viewers(viewer_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_stream_viewers_unique ON stream_viewers(stream_id, viewer_id, joined_at);

-- ==================== LIVE COMMENTS ====================
CREATE TABLE IF NOT EXISTS live_comments (
  id SERIAL PRIMARY KEY,
  stream_id INTEGER NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_live_comments_stream_id ON live_comments(stream_id);
CREATE INDEX IF NOT EXISTS idx_live_comments_created_at ON live_comments(created_at);

-- ==================== GIFTS ====================
CREATE TABLE IF NOT EXISTS gifts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon_url TEXT,
  price_tokens INTEGER NOT NULL,
  animation_url TEXT,
  rarity VARCHAR(20), -- 'common', 'rare', 'epic', 'legendary'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== STREAM GIFTS ====================
CREATE TABLE IF NOT EXISTS stream_gifts (
  id SERIAL PRIMARY KEY,
  stream_id INTEGER NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  gift_id INTEGER NOT NULL REFERENCES gifts(id) ON DELETE SET NULL,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1,
  total_tokens_spent INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stream_gifts_stream_id ON stream_gifts(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_gifts_sender_id ON stream_gifts(sender_id);

-- ==================== USER FOLLOWS ====================
CREATE TABLE IF NOT EXISTS user_follows (
  id SERIAL PRIMARY KEY,
  follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id);

-- ==================== DISCOVER FEED ====================
CREATE TABLE IF NOT EXISTS discover_posts (
  id SERIAL PRIMARY KEY,
  creator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  duration_seconds INTEGER,
  category VARCHAR(100),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_discover_posts_creator_id ON discover_posts(creator_id);
CREATE INDEX IF NOT EXISTS idx_discover_posts_category ON discover_posts(category);
CREATE INDEX IF NOT EXISTS idx_discover_posts_created_at ON discover_posts(created_at);

-- ==================== POST LIKES ====================
CREATE TABLE IF NOT EXISTS post_likes (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES discover_posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);

-- ==================== POST COMMENTS ====================
CREATE TABLE IF NOT EXISTS post_comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES discover_posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);

-- ==================== CREATOR ANALYTICS ====================
CREATE TABLE IF NOT EXISTS creator_analytics (
  id SERIAL PRIMARY KEY,
  creator_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  total_streams INTEGER DEFAULT 0,
  total_viewers INTEGER DEFAULT 0,
  total_watch_hours DECIMAL(10, 2) DEFAULT 0,
  total_earnings DECIMAL(18, 2) DEFAULT 0,
  average_viewers_per_stream INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== PAYOUTS ====================
CREATE TABLE IF NOT EXISTS payouts (
  id SERIAL PRIMARY KEY,
  creator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(18, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  stripe_transfer_id VARCHAR(255),
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payouts_creator_id ON payouts(creator_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
