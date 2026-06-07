import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { tokenDogrula } from '@dokuzbes/auth-middleware'
import { db } from '../lib/db'
import { tokenUret, odaOlustur } from '../lib/livekit'
import { AppError } from '@dokuzbes/errors'

const schema = z.object({
  masaId: z.string().uuid(),
  goruntulu: z.boolean().default(true),
  sesli: z.boolean().default(true),
})

export async function tokenRoute(app: FastifyInstance) {
  // Masa için LiveKit token al
  app.post('/livekit/token', { preHandler: tokenDogrula }, async (req) => {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) throw new AppError('GECERSIZ_VERI', 400)

    const { masaId, goruntulu, sesli } = parsed.data
    const userId = req.kullanici.userId

    // Masayı ve yetkiyi kontrol et
    const masa = await db.masa.findUnique({
      where: { id: masaId },
      include: {
        yayinci: { select: { userId: true, stageName: true } },
        musteri: { select: { nickname: true } },
      },
    })

    if (!masa) throw new AppError('MASA_BULUNAMADI', 404)

    const musteriMi = masa.musteriId === userId
    const yayinciMi = masa.yayinci.userId === userId

    if (!musteriMi && !yayinciMi) throw new AppError('YETKISIZ', 403)
    if (masa.durum === 'kapali' || masa.durum === 'iptal') {
      throw new AppError('MASA_KAPALI', 410)
    }

    const odaAdi = `masa-${masaId}`
    const kimlik = userId

    // İlk bağlananlar için odayı oluştur
    if (masa.durum === 'waiting' || masa.durum === 'aktif') {
      try {
        await odaOlustur(odaAdi)
      } catch {
        // Oda zaten varsa sorun değil
      }
    }

    // Masayı aktif'e çek (yayıncı bağlandığında)
    if (yayinciMi && masa.durum === 'waiting') {
      await db.masa.update({
        where: { id: masaId },
        data: { durum: 'aktif', baslangic: new Date() },
      })
    }

    const livekitToken = await tokenUret({
      odaAdi,
      kimlik,
      goruntulu,
      sesli,
      yayinci: yayinciMi,
    })

    return {
      token: livekitToken,
      odaAdi,
      livekitUrl: process.env.LIVEKIT_URL ?? 'ws://localhost:7880',
      rol: yayinciMi ? 'yayinci' : 'musteri',
      masa: {
        id: masa.id,
        tur: masa.tur,
        durum: masa.durum,
        performerAdi: masa.yayinci.stageName,
        musteriAdi: masa.musteri.nickname,
      },
    }
  })

  // Mevcut katılımcıları listele (masa bekle ekranı için)
  app.get('/livekit/oda/:masaId', { preHandler: tokenDogrula }, async (req) => {
    const { masaId } = req.params as { masaId: string }

    const masa = await db.masa.findUnique({
      where: { id: masaId },
      select: {
        id: true,
        durum: true,
        tur: true,
        yayinci: { select: { stageName: true, userId: true } },
        musteri: { select: { nickname: true } },
      },
    })
    if (!masa) throw new AppError('MASA_BULUNAMADI', 404)

    const userId = req.kullanici.userId
    const yetkili = masa.musteri !== null
      ? masa.yayinci.userId === userId
      : false

    return {
      masaId,
      durum: masa.durum,
      tur: masa.tur,
      performerAdi: masa.yayinci.stageName,
      musteriAdi: masa.musteri?.nickname,
    }
  })
}
