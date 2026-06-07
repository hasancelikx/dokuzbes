-- CreateTable
CREATE TABLE "bildirimler" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "tip" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "metin" TEXT NOT NULL,
    "veri" JSONB,
    "okundu" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bildirimler_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bildirimler_user_id_created_at_idx" ON "bildirimler"("user_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "bildirimler" ADD CONSTRAINT "bildirimler_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
