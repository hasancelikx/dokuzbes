import { FastifyInstance } from 'fastify'
import { db } from '../lib/db'
import { redis } from '../lib/redis'
import { tokenDogrula, roleCheck } from '@dokuzbes/auth-middleware'
import { AppError } from '@dokuzbes/errors'

export async function masaKabulRoute(app: FastifyInstance) {
  // Kabul et
  app.post('/mesa/:id/kabul',
    { preHandler: [tokenDogrula, roleCheck('performer')] },
    async (req) => {
      const { id } = req.params as { id: string }

      const yayinci = await db.performer.findUnique({
        where: { userId: req.kullanici.userId },
      })
      if (!yayinci) throw new AppError('YAYINCI_BULUNAMADI', 404)

      const masa = await db.masa.findUnique({ where: { id } })
      if (!masa) throw new AppError('MASA_BULUNAMADI', 404)
      if (masa.yayinciId !== yayinci.id) throw new AppError('YETKISIZ', 403)
      if (masa.durum !== 'waiting') throw new AppError('MASA_ARTIK_BEKLEMEDE_DEGIL', 409)

      await db.masa.update({
        where: { id },
        data: { durum: 'aktif' },
      })

      // Timeout'u iptal et
      await redis.del(`masa:timeout:${id}`)

      // Müşteriye haber ver
      await redis.publish(`user:${masa.musteriId}`, JSON.stringify({
        tip: 'MASA_KABUL',
        masaId: id,
      }))

      return { ok: true, masaId: id, durum: 'aktif' }
    }
  )

  // Reddet
  app.post('/mesa/:id/red',
    { preHandler: [tokenDogrula, roleCheck('performer')] },
    async (req) => {
      const { id } = req.params as { id: string }

      const yayinci = await db.performer.findUnique({
        where: { userId: req.kullanici.userId },
      })
      if (!yayinci) throw new AppError('YAYINCI_BULUNAMADI', 404)

      const masa = await db.masa.findUnique({ where: { id } })
      if (!masa) throw new AppError('MASA_BULUNAMADI', 404)
      if (masa.yayinciId !== yayinci.id) throw new AppError('YETKISIZ', 403)
      if (masa.durum !== 'waiting') throw new AppError('MASA_ARTIK_BEKLEMEDE_DEGIL', 409)

      // Gold iade et
      await db.$transaction(async (tx) => {
        await tx.masa.update({ where: { id }, data: { durum: 'iptal', bitis: new Date() } })

        await tx.user.update({
          where: { id: masa.musteriId },
          data: {
            gold: { increment: masa.goldMaliyet },
            aktifMasaId: null,
          },
        })

        await tx.transaction.create({
          data: {
            userId: masa.musteriId,
            tur: 'iade',
            miktar: masa.goldMaliyet,
            aciklama: 'Masa reddedildi — gold iade',
          },
        })
      })

      await redis.del(`masa:timeout:${id}`)

      await redis.publish(`user:${masa.musteriId}`, JSON.stringify({
        tip: 'MASA_RED',
        masaId: id,
      }))

      return { ok: true, masaId: id, durum: 'iptal' }
    }
  )

  // Masayı kapat
  app.post('/mesa/:id/kapat',
    { preHandler: tokenDogrula },
    async (req) => {
      const { id } = req.params as { id: string }

      const masa = await db.masa.findUnique({ where: { id } })
      if (!masa) throw new AppError('MASA_BULUNAMADI', 404)

      const yayinci = await db.performer.findUnique({
        where: { userId: req.kullanici.userId },
      })

      // Yalnızca müşteri veya yayıncı kapatabilir
      const yetkili = masa.musteriId === req.kullanici.userId ||
        (yayinci && masa.yayinciId === yayinci.id)
      if (!yetkili) throw new AppError('YETKISIZ', 403)

      await db.$transaction(async (tx) => {
        await tx.masa.update({
          where: { id },
          data: { durum: 'kapali', bitis: new Date() },
        })
        await tx.user.update({
          where: { id: masa.musteriId },
          data: { aktifMasaId: null },
        })
      })

      await redis.publish(`masa:${id}`, JSON.stringify({ tip: 'MASA_KAPANDI' }))

      return { ok: true, masaId: id, durum: 'kapali' }
    }
  )

  // Masa detayı
  app.get('/mesa/:id', { preHandler: tokenDogrula }, async (req) => {
    const { id } = req.params as { id: string }
    const masa = await db.masa.findUnique({
      where: { id },
      include: {
        musteri: { select: { nickname: true, avatarUrl: true } },
        yayinci: { select: { stageName: true, user: { select: { avatarUrl: true } } } },
      },
    })
    if (!masa) throw new AppError('MASA_BULUNAMADI', 404)
    return masa
  })
}
