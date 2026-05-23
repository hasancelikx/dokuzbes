# Kurulum Kılavuzu

## 1. Ön Koşullar

- macOS 10.15 veya üstü
- Docker Desktop yüklü
- Flutter SDK (development için)
- Git

## 2. Projeyi Clone Et

```bash
cd /Users/user/Desktop
git clone <repository-url> dokuzbes
cd dokuzbes
```

## 3. Environment Variables Ayarla

```bash
# Root dizininde
cp .env.example .env

# Backend dizininde
cp backend/.env.example backend/.env
```

## 4. Docker Containers'ı Başlat

```bash
# Backend ve Database'i başlat
docker-compose up -d

# Logs'ları kontrol et
docker-compose logs -f

# Health check
curl http://localhost:3000/health
```

## 5. Backend Setup

```bash
cd backend

# Dependencies yükle
npm install

# Migration'ları çalıştır
# (Docker'da otomatik çalışır)

# Development server'ı başlat
npm run dev
```

## 6. Frontend Setup

```bash
cd dokuzbes

# Dependencies yükle
flutter pub get

# iOS için pod'ları yükle (macOS'ta)
cd ios
pod install
cd ..

# Uygulamayı çalıştır
flutter run

# Emulator'da:
flutter run -d <emulator-id>

# Cihazda:
flutter run -d <device-id>
```

## 7. Veritabanı Bağlantısı

```bash
# PostgreSQL'e bağlan
psql -h localhost -U dokuzbes -d dokuzbes_db

# Şemayı kontrol et
\dt

# Çık
\q
```

## 8. API Testing

```bash
# Health check
curl http://localhost:3000/health

# Login endpoint'ini test et
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## 🐳 Docker Commands

```bash
# Containers'ı başlat
docker-compose up -d

# Containers'ı durdur
docker-compose down

# Logs'ları görüntüle
docker-compose logs -f backend
docker-compose logs -f postgres

# Container'a bağlan
docker-compose exec backend bash
docker-compose exec postgres psql -U dokuzbes -d dokuzbes_db

# Tüm containers'ı temizle
docker-compose down -v
```

## 🔄 Hot Reload

### Backend
- `nodemon` otomatik reload sağlar
- Dosya değişiklikleri anında yansır

### Frontend
- Flutter auto-reload etkindir
- `r` tuşu ile hot reload
- `R` tuşu ile hot restart

## ❌ Troubleshooting

### Docker Port Zaten Kullanımda
```bash
# Port kullanıcısını bul
lsof -i :3000
lsof -i :5432

# Process'i sonlandır
kill -9 <PID>
```

### Database Bağlantısı Başarısız
```bash
# Container logs'unu kontrol et
docker-compose logs postgres

# Database'i sıfırla
docker-compose down -v
docker-compose up -d
```

### Flutter Build Hatası
```bash
# Flutter cache'ini temizle
flutter clean

# Dependencies'i yeniden yükle
flutter pub get

# Build cache'ini temizle
flutter pub cache repair
```

### API Bağlantı Hatası
1. Backend'in çalışıyor mu kontrol et: `curl http://localhost:3000/health`
2. Database'in çalışıyor mu kontrol et: `docker-compose logs postgres`
3. .env dosyasındaki credentials'ı kontrol et

## 📞 Destek

Sorunla karşılaşırsan:
1. Docker logs'ları kontrol et
2. API health check'ini yap
3. Environment variables'ları doğrula
4. Stack trace'ları oku ve analiz et
