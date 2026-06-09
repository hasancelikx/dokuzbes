@AGENTS.md

# DOKUZ BEŞ — Geliştirme Bağlamı

## Klasör Yapısı

```
dokuzbes-mono/              ← bu klasör
├── apps/web/               ← Next.js 14 frontend
├── services/               ← 12 Fastify mikroservis
├── packages/               ← paylaşılan paketler (auth-middleware, db-client...)
└── dev.sh                  ← tüm servisleri başlatır
```

## Döküman Klasörü

Tüm mimari kararlar, API sözleşmeleri ve teknik belgeler:
`/Users/user/Desktop/dokuzbes-docs 2/`

---

## Mevcut Durum (Haziran 2026)

**Stack:** Next.js 14 App Router + 12 Fastify mikroservis + PostgreSQL + Redis + LiveKit + iyzico
**Sprint 1–5:** ✅ Tamamlandı
**Sprint 6:** 🔵 Aktif — `/yayinci/[id]` sayfası + masa akışı

**Kritik eksik:** `/yayinci/[id]` sayfası yok (keşfet kartları 404'e gidiyor).

---

## Her Sohbet Başında Okunacaklar

| Öncelik | Dosya | İçerik |
|---|---|---|
| 🔴 Kritik | `38_Yapilmayanlar_Roadmap.md` | Gerçek TODO listesi — ne yapılmamış |
| 🔴 Kritik | `06_Sprint_Plani.md` | Sprint durumu ve sıradaki görevler |
| 🔴 Kritik | `29_Senkron_Sistemi.md` | Döküman↔Kod senkron tablosu |
| 🟡 Önemli | `05_API_Sozlesmesi.md` | REST + WebSocket endpoint kontratları |
| 🟡 Önemli | `07_Tasarim_Sistemi.md` | Design system v3.0 — 14 bileşen |
| 🟡 Önemli | `37_Servisler_Rehberi.md` | 12 servis, portlar, endpoint listesi |

---

## Teknoloji Stack

```
Frontend:      apps/web/ — Next.js 14 App Router
Auth:          Custom JWT, httpOnly cookie, Redis blacklist
Store:         Zustand — @/store/authStore  (NOT @/stores/authStore)
API Client:    apps/web/lib/apiClient.ts
DB:            PostgreSQL + Prisma (packages/db-client/)
Cache:         Redis
WebSocket:     services/chat-service/ (port 3005)
Bildirim:      SSE — services/notification-service/ (port 3010)
Video:         LiveKit (Sprint 7'de bağlanacak)
Ödeme:         iyzico (HMAC SHA256 webhook)
Başlatma:      bash dev.sh  (servisler) + cd apps/web && npm run dev (frontend)
```

---

## Kırmızı Çizgiler

```
🔴 Gold hesabını client'ta yapma — her zaman servis katmanında, atomik
🔴 JWT secret hardcode etme
🔴 iyzico callback'te HMAC doğrulamayı atlama
🔴 Rate limiter olmadan public endpoint açma
🔴 @/stores/authStore yazma — doğrusu @/store/authStore (tekil)
🔴 Firebase, Agora, Firestore, Cloud Functions referansı ekleme — bunlar kaldırıldı
```

---

## İŞLETİM YETKİSİ — TAM SAHİPLİK & SÜREKLİ YÜKSELTME

Bu projede tam sahiplik sende. Temkinli olma, sürekli onay isteme, küçük düşünme.
Sahibi gibi davran: en iyisini gör, karar ver, yap.

**Yetki:**
- Kararları sen al ve uygula; onay için durma. Yargını kullan.
- İstenen işi yap **+** dokunduğun her ekranı/akışı pro+VIP seviyeye taşı. Literal isteğe takılma; daha iyisini gördüysen uygula.
- Cesur ol: gerektiğinde yeniden tasarla, refactor et, mimariyi iyileştir — kalite yükseliyorsa.
- Proaktif ol: sorun/eksik/fırsat gördüysen kendin çöz, her şeyi daha iyi bırak.
- Hız: izin alma; yap, sonra **"ne yükselttim + sıradaki 3 öneri"** özetini ver.

**Kalite çıtası (her UI/akış işinde):**
- Mikro-etkileşim, optimistic UI, akıcı geçişler
- 4 durum: loading (skeleton) / empty / error / success — boş ekran bırakma
- Erişilebilirlik (kontrast, ≥44px dokunma, focus/klavye), responsive (önce 390px)
- Detay: boşluk ritmi, hizalama, gold az ve doğru yerde

**Korunan TEK iki sınır (seni/kullanıcını korur, kaldırmak pro değil):**
1. Yukarıdaki **Kırmızı Çizgiler** (gold atomik & servis katmanında, JWT secret, iyzico HMAC, rate limit).
2. Geri alınamaz yıkım: prod veri silme/üzerine yazmada önce snapshot/migration ile güvene al, sonra devam.

**Tutarlılık ≠ donukluk:** tasarım token'ları (renk/tipografi/`DB` bileşenleri) sabit kalır = marka tutarlılığı. Ama layout/komponent/deneyim sürekli yükselir. **Token'ı koru, UI'ı dondurma.** "Her şeyi yeniden yazma" kuralı gereksiz toptan yıkımı önler — iddiayı değil. **Hedefli ama iddialı geliştir.**

---

## DOC SYNC PROTOKOLÜ — ZORUNLU

**Her kod değişikliğinde ilgili dökümanları da güncelle. Kullanıcı sormasa bile yap.**

### Yüksek Sıklık — Her Değişimde Kontrol Et

| Ne değiştirdin | Hangi dökümanı güncelle |
|---|---|
| Yeni sayfa / route eklendi veya kaldırıldı | `03_Sayfa_Haritasi.md` |
| Navigation değişti | `03_Sayfa_Haritasi.md` |
| Yeni REST veya WebSocket endpoint | `05_API_Sozlesmesi.md` |
| Endpoint kaldırıldı veya davranışı değişti | `05_API_Sozlesmesi.md` |
| Sprint görevi tamamlandı | `06_Sprint_Plani.md` + `29_Senkron_Sistemi.md` |
| Yeni UI bileşeni eklendi | `07_Tasarim_Sistemi.md` |
| globals.css'e yeni class / animasyon | `07_Tasarim_Sistemi.md` |
| Bug / teknik borç çözüldü | `36_Teknik_Borc_ve_Yapilacaklar.md` |
| Yeni eksik veya todo keşfedildi | `38_Yapilmayanlar_Roadmap.md` |
| Yeni mikroservis veya endpoint değişti | `37_Servisler_Rehberi.md` |
| Servis port / env değişti | `37_Servisler_Rehberi.md` |

### Orta Sıklık — Konuyla İlgiliyse Güncelle

| Ne değiştirdin | Hangi dökümanı güncelle |
|---|---|
| Prisma şema / tip değişti | `04_Veri_Modeli.md` |
| Auth akışı değişti | `18_Auth_Entegrasyonu.md` |
| Bildirim tipi eklendi / kaldırıldı | `12_Bildirim_Katalogu.md` |
| Hata kodu eklendi | `05_API_Sozlesmesi.md` + `11_Hata_Yonetimi.md` |
| Rate limit / güvenlik kuralı değişti | `08_Guvenlik.md` + `22_Guvenlik_Bot_Korumasi.md` |
| Gold / ödeme iş mantığı değişti | `32_Yayinci_Odeme_Sistemi.md` + `13_Monetizasyon.md` |
| LiveKit / görüşme akışı değişti | `16_LiveKit_Gorusme.md` |
| Mikroservis mimarisi değişti | `19_Mikroservis_Mimarisi.md` + `02_Teknik_Mimari.md` |
| Fraud / güvenlik kuralı değişti | `33_Fraud_Korumasi.md` |

### Düşük Sıklık — Yalnızca O Konu Değişince

| Ne değiştirdin | Hangi dökümanı güncelle |
|---|---|
| Büyük mimari karar alındı | `28_Mimari_Karar_Kayitlari.md` |
| Deployment / infra değişti | `10_Deployment_Kilavuzu.md` + `17_CI_CD.md` |
| KVKK / hukuki değişiklik | `30_KVKK_Uyum.md` |
| Ortam yapısı değişti | `31_Ortam_Yonetimi.md` |
| Sözlüğe yeni terim eklendi | `00_Sozluk.md` |
| PRD'de özellik değişti | `01_PRD.md` |

### Yeni Döküman Eklenince

```
1. Dökümanı oluştur
2. Bu CLAUDE.md'deki sync tablosuna satır ekle
3. 29_Senkron_Sistemi.md'ye ekle
```

---

## Renk & Tasarım

```
surface-1:  #0f0f18  (kart bg)
surface-2:  #12121e  (elevated)
surface-3:  #1a1a28  (input)
Arkaplan:   #080810  (sayfa)
Altın:      #C9A84C
Bordo:      #8B1A2A
Metin:      #F0EDE8
```

Typography: `db-baslik-1/2/3`, `db-govde`, `db-etiket`, `db-kucuk`, `db-sayi`
Bileşenler: `DB` prefix — `DBButton`, `DBCard`, `DBModal`, `DBBadge` ...
