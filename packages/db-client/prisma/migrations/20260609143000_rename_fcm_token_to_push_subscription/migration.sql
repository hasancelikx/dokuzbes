-- Firebase tamamen kaldırıldı (ADR-001). FCM (Firebase Cloud Messaging) artık
-- kullanılmıyor; bildirim için SSE (gerçek zamanlı) + Web Push/VAPID (arka plan).
-- Kolon adı bu yüzden fcm_token → push_subscription olarak değiştirildi.
ALTER TABLE "users" RENAME COLUMN "fcm_token" TO "push_subscription";
