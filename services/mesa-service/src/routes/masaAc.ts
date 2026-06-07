import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '../lib/db'
import { redis } from '../lib/redis'
import { tokenDogrula, roleCheck } from '@dokuzbes/auth-middleware'
import { AppError } from '@dokuzbes/errors'
import { MASA_FIYAT } from '../lib/goldFiyat'

const schema = z.object({
  yayinciId: z.string().uuid(),
  tur: z.enum(['kisa', 'uzun', 'ozel']),
})

export async function masaAcRoute(app: FastifyInstance) {
  app.post('/mesa/ac',
    { preHandler: [tokenDogrula, roleCheck('customer')] },
    async (req, reply) => {
      const veri = schema.safeParse(req.body)
      if (!veri.success) {
        return reply.status(422).send({ code: 'GECERSIZ_VERI', errors: veri.error.flatten() })
      }

      const { yayinciId, tur } = veri.data
      const goldMaliyet = MASA_FIYAT[tur]

      // Rate limit: aynı kullanıcı saatte 10'dan fazla masa açamasın
      const rateKey = `masa:rate:${req.kullanici.userId}`
      const count = await redis.incr(rateKey)
      if (count === 1) await redis.expire(rateKey, 3600)
      if (count > 10) throw new AppError('COK_FAZLA_MASA', 429)

      // Atomik işlem: gold düş + masa oluştur
      const masa = await db.$transaction(async (tx) => {
        // Kullanıcının gold bakiyesini kontrol et
        const kullanici = await tx.user.findUnique({
          where: { id: req.kullanici.userId },
          select: { gold: true, aktifMasaId: true },
        })

        if (!kullanici) throw new AppError('KULLANICI_BULUNAMADI', 404)
        if (kullanici.aktifMasaId) throw new AppError('ZATEN_AKTIF_MASA', 409)
        if (kullanici.gold < goldMaliyet) throw new AppError('YETERSIZ_GOLD', 402)

        // Yayıncı online mı?
        const yayinci = await tx.performer.findUnique({
          where: { id: yayinciId },
          select: { durum: true },
        })
        if (!yayinci) throw new AppError('YAYINCI_BULUNAMADI', 404)
        if (yayinci.durum !== 'online') throw new AppError('YAYINCI_MUSAIT_DEGIL', 409)

        // Gold düş
        await tx.user.update({
          where: { id: req.kullanici.userId },
          data: { gold: { decrement: goldMaliyet } },
        })

        // Transaction kaydı
        await tx.transaction.create({
          data: {
            userId: req.kullanici.userId,
            tur: 'harcama',
            miktar: -goldMaliyet,
            aciklama: `Masa açıldı (${tur})`,
          },
        })

        // Masa oluştur
        const yeniMasa = await tx.masa.create({
          data: {
            musteriId: req.kullanici.userId,
            yayinciId,
            tur,
            goldMaliyet,
            durum: 'waiting',
          },
        })

        // Kullanıcının aktif masasını güncelle
        await tx.user.update({
          where: { id: req.kullanici.userId },
          data: { aktifMasaId: yeniMasa.id },
        })

        return yeniMasa
      })

      // Redis'e bildirim — yayıncıya anlık haber ver
      await redis.publish(`performer:${yayinciId}`, JSON.stringify({
        tip: 'MASA_ISTEGI',
        masaId: masa.id,
        tur,
        goldMaliyet,
        musteriId: req.kullanici.userId,
      }))

      // 5 dakika içinde kabul/red gelmezse timeout — Redis TTL
      await redis.setex(`masa:timeout:${masa.id}`, 300, req.kullanici.userId)

      return reply.status(201).send(masa)
    }
  )
}
