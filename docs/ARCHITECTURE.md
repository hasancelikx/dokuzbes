# Dokuzbes - Mobil Uygulama Mimarisi

## 📋 Proje Yapısı

```
dokuzbes/
├── dokuzbes/              # Flutter Frontend
│   ├── lib/
│   │   ├── models/        # Veri modelleri (User, AuthResponse, vb)
│   │   ├── providers/     # State Management (Provider)
│   │   ├── screens/       # Ekranlar (LoginScreen, HomeScreen, vb)
│   │   ├── widgets/       # Reusable widgets
│   │   ├── services/      # API Client, Local Storage
│   │   ├── utils/         # Helper fonksiyonları (Logger, Validators)
│   │   ├── config/        # Tema, Konfigürasyonlar
│   │   └── main.dart      # Entry point
│   └── pubspec.yaml       # Flutter dependencies
│
├── backend/               # Node.js + Express API
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth, Error handling, Validation
│   │   ├── config/        # Database, Constants
│   │   ├── utils/         # Helpers (Response formatting)
│   │   └── index.js       # Express app entry point
│   ├── package.json       # Dependencies
│   ├── Dockerfile         # Container configuration
│   └── .env.example       # Environment variables
│
├── database/              # PostgreSQL
│   ├── 001_init_users.sql
│   ├── 002_init_sessions.sql
│   └── README.md
│
├── docker-compose.yml     # Multi-container orchestration
└── .env.example           # Root environment variables

```

## 🏗️ Mimari Açıklaması

### **Frontend (Flutter)**
- **Models**: API response'ları temsil eden veri sınıfları
- **Providers**: Provider kütüphanesi ile state management
- **Screens**: Her bir sayfanın UI bileşenleri
- **Widgets**: Tekrar kullanılabilir UI bileşenleri (Button, TextField, vb)
- **Services**: API iletişimi (ApiClient)
- **Utils**: Logging, Validation, Format helpers
- **Config**: Tema ve uygulama konfigürasyonları

### **Backend (Node.js + Express)**
- **Controllers**: HTTP request'leri işleyen logic
- **Services**: İş mantığı ve veri işleme
- **Models**: Veritabanı şemaları ve ORM
- **Routes**: Endpoint tanımlamaları
- **Middleware**: 
  - Authentication (JWT)
  - Error Handling
  - Input Validation
- **Config**: Database bağlantısı, Constants
- **Utils**: Response formatting helpers

### **Database (PostgreSQL)**
- **Users Table**: Kullanıcı bilgileri
- **Sessions Table**: JWT refresh token yönetimi
- **Audit Logs**: Sistem işlemleri kaydı
- Indexes: Sorgu optimizasyonu
- Foreign Keys: Data integrity

### **Containerization (Docker)**
- **PostgreSQL Container**: Veritabanı
- **Backend Container**: Node.js API
- **Volume Sharing**: Hot reload ve data persistence
- **Health Checks**: Container durumu kontrolü

## 🚀 Başlangıç

### Gereksinimler
- Docker & Docker Compose
- Flutter SDK (Frontend geliştirme için)
- Node.js (Local development için)

### Kurulum Adımları

1. **Environment Variables**
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   ```

2. **Docker ile Başla**
   ```bash
   docker-compose up -d
   ```

3. **Backend Bağımlılıkları** (Local development)
   ```bash
   cd backend
   npm install
   npm run dev
   ```

4. **Flutter Başlat**
   ```bash
   cd dokuzbes
   flutter pub get
   flutter run
   ```

## 📝 İş Akışı

### Yeni Endpoint Ekleme

1. **Database** - Migration ekle (`database/00X_add_feature.sql`)
2. **Backend**
   - Controller: `backend/src/controllers/featureController.js`
   - Service: `backend/src/services/featureService.js`
   - Route: `backend/src/routes/featureRoutes.js`
3. **Frontend**
   - Model: `dokuzbes/lib/models/feature_model.dart`
   - Service: `dokuzbes/lib/services/feature_service.dart`
   - Screen: `dokuzbes/lib/screens/feature_screen.dart`

### API Response Format (Standard)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Actual data
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description"
}
```

## 🔐 Güvenlik

- **JWT Token**: 7 gün geçerlilik
- **Password Hashing**: bcryptjs ile
- **CORS**: Express middleware ile
- **Helmet**: HTTP security headers
- **Input Validation**: Joi ile

## 📊 Veritabanı Şeması

### Users Table
- `id`: Primary Key
- `email`: Unique, Index
- `password`: Hashed
- `first_name`, `last_name`
- `created_at`, `updated_at`

### Sessions Table
- `id`: Primary Key
- `user_id`: Foreign Key
- `refresh_token`: Unique
- `expires_at`

## 🐛 Debugging

- **Backend Logs**: `docker-compose logs backend`
- **Database Logs**: `docker-compose logs postgres`
- **Flutter Debug**: `flutter run -v`

## ✨ Best Practices

1. **Separation of Concerns**: Her katman kendi sorumluluğu
2. **DRY Principle**: Tekrar kullanılabilir kod
3. **Error Handling**: Merkezi error handling
4. **Validation**: Frontend ve Backend'de
5. **Logging**: Debug ve production için uygun logging

## 📚 Kaynaklar

- [Flutter Documentation](https://flutter.dev/docs)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
