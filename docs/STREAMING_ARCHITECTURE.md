# 🎮 Dokuzbes - Digital Casino Live Streaming Platform

## Overview

Dokuzbes is an enterprise-grade live streaming platform combining:
- 🔴 **TikTok-style** live streams with real-time interaction
- 💰 **Token economy** for monetization (creators earn, viewers spend)
- 🎁 **Gift system** with rarity levels
- 💬 **Real-time chat** with WebSocket
- 🔐 **Enterprise security** with JWT + Stripe integration

---

## 🏗️ Architecture

### **Frontend Stack (Flutter)**
- Material 3 modern dark theme
- Provider state management
- Socket.io real-time client
- Agora SDK for video streaming
- Cached network images

### **Backend Stack (Node.js + Express)**
- Socket.io for real-time events
- Redis for caching & message queuing
- PostgreSQL for persistent data
- Agora RTC for streaming
- Stripe for payments

### **Infrastructure**
- Docker multi-container setup
- Redis for real-time data
- PostgreSQL with optimized indexes
- Agora cloud streaming

---

## 📊 New Database Schema

### **Token Economy Tables**
```
token_wallets          → User token balance
token_transactions     → Transaction history
payouts               → Creator earnings
```

### **Streaming Tables**
```
live_streams          → Active/inactive streams
stream_viewers        → Viewer analytics
stream_gifts          → Gift transactions
live_comments         → Real-time chat messages
gifts                 → Gift catalog
```

### **Social Tables**
```
user_follows          → Follow relationships
discover_posts        → Short videos/clips
post_likes            → Post engagement
post_comments         → Post comments
```

### **Analytics**
```
creator_analytics     → Creator statistics
```

---

## 🚀 New Features

### **1. Live Streaming (Phase 1)**
✅ Real-time video broadcasting via Agora
✅ Live viewer count updates
✅ Stream categories
✅ Creator dashboard

**Endpoints:**
```
POST   /api/streams/start        → Start stream
GET    /api/streams/:streamId    → Get stream details
GET    /api/streams/discover/active → List active streams
POST   /api/streams/:streamId/end → End stream
```

### **2. Real-time Chat (WebSocket)**
✅ Live comments during streams
✅ Instant message delivery
✅ Viewer presence tracking

**Socket Events:**
```
join_stream      → User joins stream
leave_stream     → User leaves stream
send_message     → Chat message
send_gift        → Gift sending
like_stream      → Stream interaction
```

### **3. Token Wallet System (Phase 2)**
✅ Token purchase via Stripe
✅ Transaction history
✅ Creator payouts
✅ Balance tracking

**Endpoints:**
```
GET    /api/wallet/balance      → Current balance
GET    /api/wallet/transactions → History
POST   /api/wallet/purchase     → Buy tokens
GET    /api/wallet/gifts        → Available gifts
```

### **4. Gift System**
✅ Rarity-based gifts (common → legendary)
✅ Token pricing
✅ Animation support
✅ Creator earnings

**Gift Rarities:**
- 🟢 Common: 10 tokens
- 🔵 Rare: 50 tokens
- 🟣 Epic: 100 tokens
- 🟡 Legendary: 500 tokens

### **5. Discovery Feed**
✅ TikTok-style infinite scroll
✅ Category filtering
✅ Creator profiles
✅ Like & comment system

---

## 💰 Token Economy Flow

```
User
  ├─ Buy Tokens (Stripe) → Token Wallet
  ├─ Send Gifts → Creator Earnings
  └─ Watch Streams → Engagement

Creator
  ├─ Go Live → Attract Viewers
  ├─ Receive Gifts → Token Balance
  └─ Withdraw → Real Money (Stripe)
```

### **Commission Model**
- Platform: 30% of gift value
- Creator: 70% of gift value

Example:
- User sends 100 token gift
- Creator receives: 70 tokens
- Platform receives: 30 tokens

---

## 🔌 WebSocket Events

### **Stream Events**
```javascript
// Client → Server
socket.emit('join_stream', streamId)
socket.emit('leave_stream', streamId)
socket.emit('stream_live', { streamId, title })
socket.emit('stream_ended', streamId)

// Server → Client
socket.on('viewer_count', { count })
socket.on('stream_started', { streamId, title })
socket.on('stream_ended', { streamId, totalViewers })
```

### **Chat Events**
```javascript
// Client → Server
socket.emit('send_message', { streamId, message })
socket.emit('send_gift', { streamId, giftId, quantity })
socket.emit('like_stream', streamId)

// Server → Client
socket.on('new_message', messageData)
socket.on('new_gift', giftData)
socket.on('stream_liked', { totalLikes })
```

---

## 🎯 API Response Format

### **Success Response**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* actual data */ }
}
```

### **Stream Response**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Gaming Session",
    "creator": {
      "id": 1,
      "username": "creator123",
      "verified": true
    },
    "isLive": true,
    "currentViewers": 150,
    "category": "games",
    "agoraToken": "...",
    "agoraAppId": "..."
  }
}
```

---

## 🔐 Security Features

1. **JWT Authentication**
   - 7-day token expiry
   - Refresh token rotation
   - Session tracking

2. **Stripe Integration**
   - PCI compliance
   - Secure payment processing
   - Webhook verification

3. **Real-time Security**
   - WebSocket auth middleware
   - Per-user channel subscriptions
   - Rate limiting on events

4. **Data Protection**
   - Encrypted passwords (bcrypt)
   - CORS enabled
   - Helmet security headers

---

## 📱 Flutter UI/UX

### **Modern Dark Theme**
- Primary: Indigo (#6366F1)
- Accent: Pink (#EC4899)
- Background: Slate (#0F172A)
- Live indicator: Red (#EF4444)

### **Screens**
1. **Discover** - Infinite scroll of live streams
2. **Live Stream** - Video + chat + gifts interface
3. **Wallet** - Token balance & transaction history
4. **Creator Dashboard** - Stream management
5. **Profile** - User stats & settings

---

## 🔄 Data Flow Example

### **User watches stream → sends gift**

1. User joins stream (WebSocket)
2. Realtime viewer count updates
3. User selects gift (100 tokens)
4. Client verifies balance
5. Socket event: `send_gift` → Server
6. Server:
   - Deducts tokens from user
   - Adds 70% to creator
   - Records transaction
   - Broadcasts gift animation
7. Creator sees gift notification
8. Analytics updated

---

## 🚀 Performance Optimizations

### **Caching (Redis)**
- Stream viewer counts
- Creator profiles
- Gift catalog
- Popular streams
- Cache TTL: 3600s

### **Database Indexes**
```sql
-- Key indexes for performance
CREATE INDEX idx_live_streams_is_live ON live_streams(is_live)
CREATE INDEX idx_token_transactions_user_id ON token_transactions(user_id)
CREATE INDEX idx_user_follows_follower_id ON user_follows(follower_id)
```

### **Real-time Optimization**
- Connection pooling
- Message batching
- Redis pub/sub
- Horizontal scaling ready

---

## 📈 Analytics Dashboard (Future)

Tracked metrics:
- Total viewers
- Watch time (hours)
- Total earnings (USD)
- Gift distribution
- Growth rate

---

## 🔄 Development Workflow

### **Adding New Feature**

1. **Database Migration**
   ```bash
   database/00X_feature.sql
   ```

2. **Backend**
   ```
   controllers/ → Service logic
   services/   → Business logic
   routes/     → API endpoints
   models/     → Data structure
   ```

3. **Frontend**
   ```
   models/     → Data classes
   services/   → API calls
   providers/  → State management
   screens/    → UI screens
   ```

4. **Real-time** (if needed)
   ```
   websocket/handlers/ → Socket events
   ```

---

## 🧪 Testing Commands

```bash
# Check health
curl http://localhost:3000/health

# Get active streams
curl http://localhost:3000/api/streams/discover/active

# Get wallet balance (needs auth)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/wallet/balance
```

---

## 📦 Deployment

### **Docker Production**
```bash
# Build
docker-compose -f docker-compose.yml build

# Run
docker-compose up -d

# Logs
docker-compose logs -f backend
```

### **Environment Variables**
```
AGORA_APP_ID=your_agora_id
AGORA_APP_CERTIFICATE=your_agora_cert
STRIPE_SECRET_KEY=sk_live_...
REDIS_HOST=redis-server
```

---

## 🎯 Next Phases

### **Phase 1** ✅ (Current)
- [x] Live streaming
- [x] Real-time chat
- [x] Token wallet
- [x] Gift system
- [x] Discover feed

### **Phase 2** (Next)
- [ ] Advanced recommendations
- [ ] Twitch-style panels
- [ ] Multi-quality streaming
- [ ] Content moderation

### **Phase 3** (Future)
- [ ] Subscription system
- [ ] Private streams
- [ ] Merchandise store
- [ ] Live competitions

---

## 📞 Support

For questions or issues:
1. Check error logs: `docker-compose logs`
2. Review API docs
3. Check Socket.io connections
4. Verify Agora credentials

---

**Built with ❤️ for creators and communities**
