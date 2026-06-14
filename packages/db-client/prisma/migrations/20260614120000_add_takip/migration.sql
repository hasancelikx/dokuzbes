-- Takip (follow) ilişkisi: kullanıcı → performer
CREATE TABLE "takipler" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "takipci_id" UUID NOT NULL,
    "performer_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "takipler_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "takipler_takipci_id_performer_id_key" ON "takipler"("takipci_id", "performer_id");
CREATE INDEX "takipler_performer_id_idx" ON "takipler"("performer_id");

ALTER TABLE "takipler" ADD CONSTRAINT "takipler_takipci_id_fkey"
    FOREIGN KEY ("takipci_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "takipler" ADD CONSTRAINT "takipler_performer_id_fkey"
    FOREIGN KEY ("performer_id") REFERENCES "performers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
