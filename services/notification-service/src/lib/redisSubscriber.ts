import Redis from 'ioredis'
import { db } from './db'
import { kullaniciyaGonder } from './sseManager'

const subscriber = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379')

interface RedisMesaji {
  tip: string
  masaId?: string
  hediyeAdi?: string
  goldMiktar?: number
  performerAdi?: string
  musteriAdi?: string
  [key: string]: unknown
}

// Bir kullanıcıya bildirim kaydet ve anlık ilet
async function bildirimKaydet(
  userId: string,
  tip: string,
  baslik: string,
  metin: string,
  veri?: object
) {
  const bildirim = await db.bildirim.create({
    data: { userId, tip, baslik, metin, veri: veri as any },
    select: { id: true, tip: true, baslik: true, metin: true, veri: true, createdAt: true, okundu: true },
  })

  // SSE ile anlık gönder
  kullaniciyaGonder(userId, { tur: 'BILDIRIM', bildirim })
}

// user:{userId} kanalı — müşteri/performer bildirimleri
subscriber.psubscribe('user:*', (err) => {
  if (err) console.error('Redis psubscribe hatası:', err)
  else console.log('Redis user:* kanalı dinleniyor')
})

subscriber.on('pmessage', async (_pattern: string, channel: string, mesaj: string) => {
  const userId = channel.replace('user:', '')
  let veri: RedisMesaji

  try {
    veri = JSON.parse(mesaj)
  } catch {
    return
  }

  try {
    switch (veri.tip) {
      case 'MASA_KABUL':
        await bildirimKaydet(
          userId,
          'MASA_KABUL',
          'Masa Kabul Edildi',
          'Yayıncı masanıza katıldı. Görüşmeniz başlıyor!',
          { masaId: veri.masaId }
        )
        break

      case 'MASA_RED':
        await bildirimKaydet(
          userId,
          'MASA_RED',
          'Masa Reddedildi',
          'Yayıncı şu an müsait değil. Gold iade edildi.',
          { masaId: veri.masaId }
        )
        break

      case 'HEDIYE_ALINDI':
        await bildirimKaydet(
          userId,
          'HEDIYE_ALINDI',
          'Yeni Hediye!',
          `${veri.gondericiAdi ?? 'Biri'} sana ${veri.hediyeAdi ?? 'hediye'} gönderdi (+${veri.goldMiktar ?? 0} gold)`,
          { masaId: veri.masaId, goldMiktar: veri.goldMiktar }
        )
        break

      case 'GOLD_YUKLENDI':
        await bildirimKaydet(
          userId,
          'GOLD_YUKLENDI',
          'Gold Yüklendi',
          `Hesabına ${veri.goldMiktar} gold eklendi.`,
          { goldMiktar: veri.goldMiktar }
        )
        break

      case 'BASVURU_ONAYLANDI':
        await bildirimKaydet(
          userId,
          'BASVURU_ONAYLANDI',
          'Başvurun Onaylandı!',
          'Performer başvurun kabul edildi. Yayına başlayabilirsin!',
          {}
        )
        break

      case 'BASVURU_REDDEDILDI':
        await bildirimKaydet(
          userId,
          'BASVURU_REDDEDILDI',
          'Başvurun Reddedildi',
          'Performer başvurun incelendi ancak onaylanmadı.',
          {}
        )
        break

      default:
        // Bilinmeyen tip — sessiz geç
        break
    }
  } catch (e) {
    console.error('Bildirim kayıt hatası:', e)
  }
})

subscriber.on('error', (err) => console.error('Redis subscriber hatası:', err))

export { subscriber }
