<<<<<<< HEAD
# 🎮 Dokuzbes - Digital Casino Live Streaming Platform

[![Flutter](https://img.shields.io/badge/Flutter-3.0+-blue?logo=flutter)](https://flutter.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com/)

Dijital gazino platformu. **TikTok-style** canlı yayınlar + **Twitch-style** token ekonomisi + **Azar-style** real-time etkileşim.

## ✨ Özellikler

### 🔴 **Live Streaming**
- Gerçek-zamanlı video yayını (Agora SDK)
- Canlı izleyici sayısı
- Stream kategorileri (games, music, talk, etc)
- Creator dashboard

### 💬 **Real-time Chat**
- WebSocket ile anlık mesajlaşma
- Live comments
- Emoji & formatting support
- User presence tracking

### 💰 **Token Economy**
- Token satın alma (Stripe integration)
- Creator para kazanma
- 70/30 commission model
- Secure wallet system

### 🎁 **Gift System**
- Nadir seviyeli hediyeler (Common → Legendary)
- Animasyonlu hediye gösterimi
- Creator para kazanma
- Transaction history

### 🔍 **Discovery Feed**
- TikTok-style infinite scroll
- Kategori filtreleme
- Creator profilleri
- Like & comment sistem

### 👥 **Social Features**
- Follow/Unfollow
- Creator profiles
- Analytics dashboard
- User statistics

---

## 🏗️ Architecture

```
FRONTEND              BACKEND              STORAGE
├─ Flutter            ├─ Node.js + Express  ├─ PostgreSQL
├─ Material 3 UI      ├─ Socket.io          ├─ Redis
├─ Provider State     ├─ REST API           └─ Agora Cloud
├─ Agora SDK          └─ WebSocket
└─ Real-time
```

### **Tech Stack**
- **Frontend**: Flutter 3.x, Provider, Material 3
- **Backend**: Node.js, Express, Socket.io
- **Database**: PostgreSQL + Redis
- **Payment**: Stripe
- **Streaming**: Agora RTC
- **Deployment**: Docker + Docker Compose

---

## 📁 Project Structure

```
dokuzbes/
├── dokuzbes/                 # Flutter Frontend
│   ├── lib/
│   │   ├── models/          # Data models (Stream, Wallet, Gift)
│   │   ├── screens/         # UI screens (Discover, Live, Wallet)
│   │   ├── providers/       # State management (Provider)
│   │   ├── services/        # API & WebSocket clients
│   │   ├── config/          # Theme & Configuration
│   │   └── main.dart        # Entry point
│   └── pubspec.yaml         # Dependencies
│
├── backend/                  # Node.js Backend
│   ├── src/
│   │   ├── controllers/     # HTTP handlers
│   │   ├── services/        # Business logic
│   │   ├── models/          # Database schemas
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth, Validation
│   │   ├── websocket/       # Socket.io handlers
│   │   ├── payment/         # Stripe integration
│   │   ├── streaming/       # Agora integration
│   │   ├── config/          # Configuration
│   │   └── index.js         # Express app
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── database/                 # Database Migrations
│   ├── 001_init_users.sql
│   ├── 002_init_sessions.sql
│   └── 003_casino_app_schema.sql (NEW)
│
├── docs/
│   ├── ARCHITECTURE.md              # System design
│   ├── STREAMING_ARCHITECTURE.md    # NEW - Streaming features
│   ├── QUICK_START_STREAMING.md     # NEW - Getting started
│   ├── DEVELOPMENT.md               # Development guide
│   └── API_DOCS.md                  # API reference
│
├── docker-compose.yml        # Multi-container setup
├── .env.example
└── README.md (this file)
```

---

## 🚀 Quick Start

### **Gereksinimler**
- Docker & Docker Compose
- Flutter SDK 3.0+
- Node.js 18+

### **Installation**

```bash
# 1. Clone repository
git clone <repo> && cd dokuzbes

# 2. Setup environment
cp .env.example .env
cp backend/.env.example backend/.env

# 3. Configure credentials (in backend/.env)
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_cert
STRIPE_SECRET_KEY=sk_test_your_key

# 4. Start Docker containers
docker-compose up -d

# 5. Backend (Terminal 2)
cd backend
npm install
npm run dev

# 6. Flutter (Terminal 3)
cd dokuzbes
flutter pub get
flutter run
```

### **Test Health**
```bash
curl http://localhost:3000/health
# Response: {"status":"OK","timestamp":"..."}
```

---

## 📚 API Endpoints

### **Streams**
```
GET    /api/streams/discover/active      # Active streams
POST   /api/streams/start                # Start stream
GET    /api/streams/:streamId            # Stream details
POST   /api/streams/:streamId/end        # End stream
GET    /api/streams/creator/:creatorId   # Creator's streams
```

### **Wallet**
```
GET    /api/wallet/balance               # Token balance
GET    /api/wallet/transactions          # Transaction history
POST   /api/wallet/purchase              # Buy tokens
GET    /api/wallet/gifts                 # Available gifts
```

### **Auth** (Existing)
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
```

---

## 🔌 WebSocket Events

### **Stream Events**
```javascript
socket.emit('join_stream', streamId)
socket.emit('leave_stream', streamId)
socket.emit('stream_live', { streamId, title })
socket.emit('stream_ended', streamId)

socket.on('viewer_count', { count })
socket.on('stream_started', { streamId, title })
socket.on('stream_ended', { streamId, totalViewers })
```

### **Chat Events**
```javascript
socket.emit('send_message', { streamId, message })
socket.emit('send_gift', { streamId, giftId, quantity })
socket.emit('like_stream', streamId)

socket.on('new_message', messageData)
socket.on('new_gift', giftData)
socket.on('stream_liked', { totalLikes })
```

---

## 💾 Database Schema

### **Core Tables**
- **users** - User accounts
- **token_wallets** - Token balance
- **token_transactions** - Transaction history
- **live_streams** - Active/inactive streams
- **stream_viewers** - Viewer analytics
- **stream_gifts** - Gift transactions
- **live_comments** - Real-time chat
- **gifts** - Gift catalog
- **user_follows** - Social graph

[Full schema in database/003_casino_app_schema.sql](database/003_casino_app_schema.sql)

---

## 💰 Token Economy

### **Purchase Flow**
```
User → Stripe Payment → Tokens in Wallet
```

### **Gift Flow**
```
Viewer (100 tokens) → Send Gift → Creator (70 tokens) + Platform (30 tokens)
```

### **Gift Rarity**
| Rarity | Price | Icon |
|--------|-------|------|
| Common | 10 | 🟢 |
| Rare | 50 | 🔵 |
| Epic | 100 | 🟣 |
| Legendary | 500 | 🟡 |

---

## 🎨 UI/UX

### **Modern Dark Theme**
- Primary Color: **Indigo** (#6366F1)
- Accent Color: **Pink** (#EC4899)
- Background: **Slate** (#0F172A)

### **Screens**
1. **Discover** - Infinite scroll live streams
2. **Live Stream** - Video + chat + gifts
3. **Wallet** - Token management
4. **Creator Dashboard** - Stream analytics
5. **Profile** - User settings & stats

---

## 🔐 Security

✅ **JWT Authentication** (7-day expiry)
✅ **Stripe PCI Compliance**
✅ **WebSocket Auth Middleware**
✅ **CORS Protection**
✅ **Helmet Security Headers**
✅ **Password Encryption** (bcryptjs)
✅ **Rate Limiting**
✅ **SQL Injection Prevention**

---

## 📊 Performance

### **Caching (Redis)**
- Stream viewer counts (TTL: 3600s)
- Creator profiles
- Gift catalog
- Popular streams

### **Database Optimization**
- Indexed queries
- Connection pooling
- Read replicas (future)

### **Real-time Performance**
- WebSocket connection pooling
- Message batching
- Efficient room management

---

## 📖 Documentation

- [🏗️ Full Architecture](docs/STREAMING_ARCHITECTURE.md)
- [🚀 Quick Start Guide](docs/QUICK_START_STREAMING.md)
- [📚 Development Guide](docs/DEVELOPMENT.md)
- [🔌 API Reference](docs/API_DOCS.md)

---

## 🔄 Development Workflow

### **Add New Feature**

1. **Database Migration**
   ```bash
   database/00X_feature_name.sql
   ```

2. **Backend Implementation**
   - Model → Service → Controller → Routes

3. **Frontend Implementation**
   - Model → Service → Provider → Screen

4. **Real-time** (if needed)
   - WebSocket events in `websocket/handlers/`

---

## 🧪 Testing

### **Health Check**
```bash
curl http://localhost:3000/health
```

### **Get Active Streams**
```bash
curl http://localhost:3000/api/streams/discover/active
```

### **Get Wallet Balance**
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/wallet/balance
```

---

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Connect to database
docker-compose exec postgres psql -U dokuzbes -d dokuzbes_db

# Rebuild containers
docker-compose build --no-cache
```

---

## 🎯 Roadmap

### **Phase 1** ✅ (Current)
- [x] Live streaming infrastructure
- [x] Real-time chat system
- [x] Token wallet & transactions
- [x] Gift system
- [x] Discovery feed

### **Phase 2** (Next 2-4 weeks)
- [ ] Advanced recommendations
- [ ] Creator analytics dashboard
- [ ] Multi-quality streaming
- [ ] Content moderation tools

### **Phase 3** (Future)
- [ ] Subscription tiers
- [ ] Private/paid streams
- [ ] Merchandise store
- [ ] Live competitions

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push branch: `git push origin feature/amazing-feature`
4. Open Pull Request

---

## 📞 Support

**Issues & Troubleshooting:**
1. Check [Quick Start Guide](docs/QUICK_START_STREAMING.md)
2. Review Docker logs: `docker-compose logs`
3. Check API response status codes
4. Verify environment variables

**Contact:**
- Documentation: See [docs/](docs/)
- Issues: GitHub Issues
- Questions: Check API_DOCS.md

---

## 📜 License

ISC License - see LICENSE file for details

---

## 🙏 Acknowledgments

- **Agora** - Live streaming infrastructure
- **Stripe** - Payment processing
- **Flutter Team** - Mobile framework
- **Node.js Community** - Backend runtime

---

## 🎉 Ready to Go Live?

Start streaming now:
```bash
cd dokuzbes && flutter run
```

**Happy streaming!** 🚀

---

*Built with ❤️ for creators, viewers, and communities*

**Language:** Turkish/English (Türkçe/İngilizce)
**Status:** Active Development 🚀
**Last Updated:** May 22, 2026

=======
# dokuzbes
>>>>>>> 9c42173c8b7f789eb505858c8b75710adaa8f04c
