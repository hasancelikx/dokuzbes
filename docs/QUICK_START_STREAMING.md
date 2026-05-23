# Quick Start - Digital Casino Platform

## 🚀 First Run (5 min)

### **1. Install Dependencies**
```bash
# Backend
cd backend
npm install

# Flutter  
cd ../dokuzbes
flutter pub get
```

### **2. Database Setup**
```bash
# Run migrations automatically via Docker
docker-compose up -d postgres

# Or manually
psql -h localhost -U dokuzbes -d dokuzbes_db -f database/001_init_users.sql
psql -h localhost -U dokuzbes -d dokuzbes_db -f database/002_init_sessions.sql
psql -h localhost -U dokuzbes -d dokuzbes_db -f database/003_casino_app_schema.sql
```

### **3. Environment Setup**
```bash
# Copy env files
cp .env.example .env
cp backend/.env.example backend/.env

# Add your keys to backend/.env:
AGORA_APP_ID=your_app_id
AGORA_APP_CERTIFICATE=your_cert
STRIPE_SECRET_KEY=sk_test_your_key
```

### **4. Start Services**
```bash
# Terminal 1: Docker
docker-compose up -d

# Terminal 2: Backend
cd backend && npm run dev

# Terminal 3: Flutter
cd dokuzbes && flutter run
```

### **5. Test Health**
```bash
curl http://localhost:3000/health
# Should return: {"status":"OK","timestamp":"..."}
```

---

## 🎮 Features to Test

### **Active Streams**
```bash
curl http://localhost:3000/api/streams/discover/active
```

### **Start Stream (Creator)**
```bash
curl -X POST http://localhost:3000/api/streams/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Gaming Live",
    "description": "Multiplayer stream",
    "category": "games"
  }'
```

### **Get Wallet**
```bash
curl http://localhost:3000/api/wallet/balance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Get Gifts**
```bash
curl http://localhost:3000/api/wallet/gifts
```

---

## 🔌 Real-time Testing (Socket.io)

### **Using WebSocket Client**
```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3000', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});

// Join stream
socket.emit('join_stream', 1);

// Send message
socket.emit('send_message', {
  streamId: 1,
  message: 'Hello stream!'
});

// Send gift
socket.emit('send_gift', {
  streamId: 1,
  giftId: 1,
  quantity: 1
});

// Listen for messages
socket.on('new_message', (data) => {
  console.log('New message:', data);
});

socket.on('new_gift', (data) => {
  console.log('New gift:', data);
});
```

---

## 📱 Flutter Development

### **Hot Reload**
```bash
flutter run
# Press 'r' for hot reload
# Press 'R' for restart
```

### **Build APK**
```bash
flutter build apk --release
```

### **Build iOS**
```bash
flutter build ios --release
```

---

## 🐛 Troubleshooting

### **Port Already in Use**
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or change PORT in .env
```

### **Redis Connection Failed**
```bash
# Check Redis in Docker
docker-compose ps
docker-compose logs redis

# Restart
docker-compose restart redis
```

### **WebSocket Connection Issues**
```bash
# Check Socket.io logs in terminal
# Look for "✅ Connected to real-time server"

# Test with curl
curl http://localhost:3000/health
```

### **Database Connection Error**
```bash
# Check PostgreSQL
docker-compose logs postgres

# Verify credentials in .env
# Test connection
psql -h localhost -U dokuzbes -d dokuzbes_db
```

---

## 📊 Database Inspection

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U dokuzbes -d dokuzbes_db

# List tables
\dt

# Check users table
SELECT * FROM users;

# Check wallet
SELECT * FROM token_wallets;

# Check active streams
SELECT * FROM live_streams WHERE is_live = true;

# Exit
\q
```

---

## 🔄 Reset Everything

```bash
# Stop all containers
docker-compose down

# Remove volumes (CAREFUL!)
docker-compose down -v

# Restart fresh
docker-compose up -d
```

---

## 📝 Common Tasks

### **Create Test User**
```sql
INSERT INTO users (email, password, username, is_creator)
VALUES ('creator@test.com', 'hashed_password', 'testcreator', true);

INSERT INTO token_wallets (user_id, balance, total_earned)
VALUES (1, 1000.00, 0);
```

### **Add Test Gifts**
```sql
INSERT INTO gifts (name, icon_url, price_tokens, rarity, is_active)
VALUES 
  ('Heart', 'https://...', 10, 'common', true),
  ('Diamond', 'https://...', 50, 'rare', true),
  ('Crown', 'https://...', 100, 'epic', true);
```

### **Check Real-time Activity**
```bash
# Backend logs show:
# - User connections
# - Stream events
# - Chat messages
# - Gift transactions

docker-compose logs -f backend | grep "📨\|🎁\|👀"
```

---

## 🎯 Next Steps

1. **Register a user** via Flutter UI
2. **Create live stream** (as creator)
3. **Join stream** (as viewer)
4. **Send message** in live chat
5. **Send gift** to creator
6. **Check wallet** transaction history

---

**Ready to go live!** 🚀
