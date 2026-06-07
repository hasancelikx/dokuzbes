-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "google_uid" TEXT,
    "role" TEXT NOT NULL DEFAULT 'customer',
    "nickname" TEXT,
    "city" TEXT,
    "avatar_url" TEXT,
    "gold" INTEGER NOT NULL DEFAULT 20,
    "total_spent" INTEGER NOT NULL DEFAULT 0,
    "total_purchased" INTEGER NOT NULL DEFAULT 0,
    "vip_level" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'active',
    "shadow_banned" BOOLEAN NOT NULL DEFAULT false,
    "aktif_masa_id" UUID,
    "fcm_token" TEXT,
    "last_seen" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "stage_name" TEXT NOT NULL,
    "bio" TEXT,
    "city" TEXT,
    "category" TEXT,
    "durum" TEXT NOT NULL DEFAULT 'offline',
    "toplam_hediye" INTEGER NOT NULL DEFAULT 0,
    "toplam_gorusme" INTEGER NOT NULL DEFAULT 0,
    "aktif_izleyici" INTEGER NOT NULL DEFAULT 0,
    "puan" DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    "vip_seviye" INTEGER NOT NULL DEFAULT 1,
    "etiketler" TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performer_applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "stage_name" TEXT NOT NULL,
    "bio" TEXT,
    "city" TEXT,
    "category" TEXT,
    "durum" TEXT NOT NULL DEFAULT 'beklemede',
    "red_sebebi" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMPTZ,

    CONSTRAINT "performer_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "masalar" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "musteri_id" UUID NOT NULL,
    "yayinci_id" UUID NOT NULL,
    "tur" TEXT NOT NULL,
    "gold_maliyet" INTEGER NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'waiting',
    "baslangic" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bitis" TIMESTAMPTZ,

    CONSTRAINT "masalar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mesajlar" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "masa_id" UUID NOT NULL,
    "gonderici_id" UUID NOT NULL,
    "metin" TEXT NOT NULL,
    "okundu" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mesajlar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gorusmeler" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "musteri_id" UUID NOT NULL,
    "yayinci_id" UUID NOT NULL,
    "tur" TEXT NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'aktif',
    "channel_name" TEXT NOT NULL,
    "baslangic" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bitis" TIMESTAMPTZ,
    "toplam_dakika" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "gorusmeler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "tur" TEXT NOT NULL,
    "miktar" INTEGER NOT NULL,
    "aciklama" TEXT,
    "iyzico_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processed_payments" (
    "payment_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "paket_id" TEXT NOT NULL,
    "gold_eklendi" INTEGER NOT NULL,
    "processed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processed_payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "hediyeler_katalog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "isim" TEXT NOT NULL,
    "ikon" TEXT NOT NULL,
    "gold_maliyet" INTEGER NOT NULL,
    "animasyon" TEXT,
    "kategori" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "hediyeler_katalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hediye_gonderimleri" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "gonderici_id" UUID NOT NULL,
    "alici_id" UUID NOT NULL,
    "hediye_id" UUID NOT NULL,
    "masa_id" UUID NOT NULL,
    "gold_maliyet" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hediye_gonderimleri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cekim_talepleri" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "performer_id" UUID NOT NULL,
    "gold_miktar" INTEGER NOT NULL,
    "tl_miktar" DECIMAL(10,2) NOT NULL,
    "iban" TEXT NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'beklemede',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMPTZ,

    CONSTRAINT "cekim_talepleri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sikayetler" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sikayet_eden" UUID NOT NULL,
    "sikayet_edilen" UUID NOT NULL,
    "sebep" TEXT,
    "durum" TEXT NOT NULL DEFAULT 'acik',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sikayetler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ayarlar" (
    "anahtar" TEXT NOT NULL,
    "deger" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ayarlar_pkey" PRIMARY KEY ("anahtar")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_uid_key" ON "users"("google_uid");

-- CreateIndex
CREATE UNIQUE INDEX "users_nickname_key" ON "users"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "performers_user_id_key" ON "performers"("user_id");

-- CreateIndex
CREATE INDEX "performers_durum_idx" ON "performers"("durum");

-- CreateIndex
CREATE INDEX "performers_puan_idx" ON "performers"("puan" DESC);

-- CreateIndex
CREATE INDEX "masalar_yayinci_id_durum_idx" ON "masalar"("yayinci_id", "durum");

-- CreateIndex
CREATE INDEX "mesajlar_masa_id_created_at_idx" ON "mesajlar"("masa_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "gorusmeler_channel_name_key" ON "gorusmeler"("channel_name");

-- CreateIndex
CREATE INDEX "gorusmeler_durum_idx" ON "gorusmeler"("durum");

-- CreateIndex
CREATE INDEX "transactions_user_id_created_at_idx" ON "transactions"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "hediye_gonderimleri_alici_id_created_at_idx" ON "hediye_gonderimleri"("alici_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "performers" ADD CONSTRAINT "performers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performer_applications" ADD CONSTRAINT "performer_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "masalar" ADD CONSTRAINT "masalar_musteri_id_fkey" FOREIGN KEY ("musteri_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "masalar" ADD CONSTRAINT "masalar_yayinci_id_fkey" FOREIGN KEY ("yayinci_id") REFERENCES "performers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesajlar" ADD CONSTRAINT "mesajlar_masa_id_fkey" FOREIGN KEY ("masa_id") REFERENCES "masalar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesajlar" ADD CONSTRAINT "mesajlar_gonderici_id_fkey" FOREIGN KEY ("gonderici_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gorusmeler" ADD CONSTRAINT "gorusmeler_musteri_id_fkey" FOREIGN KEY ("musteri_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gorusmeler" ADD CONSTRAINT "gorusmeler_yayinci_id_fkey" FOREIGN KEY ("yayinci_id") REFERENCES "performers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processed_payments" ADD CONSTRAINT "processed_payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hediye_gonderimleri" ADD CONSTRAINT "hediye_gonderimleri_gonderici_id_fkey" FOREIGN KEY ("gonderici_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hediye_gonderimleri" ADD CONSTRAINT "hediye_gonderimleri_alici_id_fkey" FOREIGN KEY ("alici_id") REFERENCES "performers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hediye_gonderimleri" ADD CONSTRAINT "hediye_gonderimleri_hediye_id_fkey" FOREIGN KEY ("hediye_id") REFERENCES "hediyeler_katalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hediye_gonderimleri" ADD CONSTRAINT "hediye_gonderimleri_masa_id_fkey" FOREIGN KEY ("masa_id") REFERENCES "masalar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cekim_talepleri" ADD CONSTRAINT "cekim_talepleri_performer_id_fkey" FOREIGN KEY ("performer_id") REFERENCES "performers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sikayetler" ADD CONSTRAINT "sikayetler_sikayet_eden_fkey" FOREIGN KEY ("sikayet_eden") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sikayetler" ADD CONSTRAINT "sikayetler_sikayet_edilen_fkey" FOREIGN KEY ("sikayet_edilen") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
