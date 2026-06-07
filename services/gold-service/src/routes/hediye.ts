import { FastifyInstance } from 'fastify'
import { tokenDogrula } from '@dokuzbes/auth-middleware'
import { db } from '../lib/db'
import { redis } from '../lib/redis'
import { AppError } from '@dokuzbes/errors'
import { z } from 'zod'

const hediyeGonderSchema = z.object({
  hediyeId: z.string().uuid(),
  masaId: z.string().uuid(),
  performerId: z.string().uuid(),
})

export async function hediyeRoute(app: FastifyInstance) {
  // GET /gold/hediyeler — katalog listesi
  app.get('/gold/hediyeler', async () => {
    const katalog = await db.hediyeKatalog.findMany({
      where: { aktif: true },
      orderBy: { goldMaliyet: 'asc' },
    })
    return { hediyeler: katalog }
  })

  // POST /gold/hediye-gonder — hediye gönder (atomic)
  app.post('/gold/hediye-gonder', { preHandler: tokenDogrula }, async (req: any) => {
    const parsed = hediyeGonderSchema.safeParse(req.body)
    if (!parsed.success) throw new AppError('GECERSIZ_VERI', 400)

    const { hediyeId, masaId, performerId } = parsed.data

    const sonuc = await db.$transaction(async (tx) => {
      const hediye = await tx.hediyeKatalog.findUnique({ where: { id: hediyeId, aktif: true } })
      if (!hediye) throw new AppError('HEDIYE_YOK', 404)

      const user = await tx.user.findUnique({ where: { id: req.kullanici.userId } })
      if (!user) throw new AppError('KULLANICI_YOK', 404)
      if (user.gold < hediye.goldMaliyet) throw new AppError('YETERSIZ_GOLD', 400)

      const masa = await tx.masa.findUnique({ where: { id: masaId } })
      if (!masa || masa.durum !== 'aktif') throw new AppError('MASA_AKTIF_DEGIL', 400)

      const performer = await tx.performer.findUnique({ where: { id: performerId } })
      if (!performer) throw new AppError('PERFORMER_YOK', 404)

      await tx.user.update({
        where: { id: req.kullanici.userId },
        data: { gold: { decrement: hediye.goldMaliyet } },
      })

      await tx.transaction.create({
        data: {
          userId: req.kullanici.userId,
          tur: 'hediye_gonder',
          miktar: -hediye.goldMaliyet,
          aciklama: `${hediye.isim} hediyesi gönderildi`,
        },
      })

      const gonderim = await tx.hediyeGonderimi.create({
        data: {
          gondericiId: req.kullanici.userId,
          aliciId: performerId,
          hediyeId,
          masaId,
          goldMaliyet: hediye.goldMaliyet,
        },
      })

      return { gonderim, hediye }
    })

    // Redis ile chat-service'e bildirim gönder (animasyon tetiklemek için)
    await redis.publish(`masa:${masaId}`, JSON.stringify({
      tip: 'hediye',
      gonderimId: sonuc.gonderim.id,
      hediyeIsim: sonuc.hediye.isim,
      hediyeIkon: sonuc.hediye.ikon,
      animasyon: sonuc.hediye.animasyon,
      gondericiId: req.kullanici.userId,
    }))

    return { basarili: true, kalanGold: (await db.user.findUnique({
      where: { id: req.kullanici.userId },
      select: { gold: true },
    }))!.gold }
  })

  // GET /gold/hediye-gecmis/:performerId — performer'a gelen hediyeler
  app.get('/gold/hediye-gecmis/:performerId', { preHandler: tokenDogrula }, async (req: any) => {
    const gonderilenler = await db.hediyeGonderimi.findMany({
      where: { aliciId: req.params.performerId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { hediye: { select: { isim: true, ikon: true } } },
    })
    return { gonderilenler }
  })
}
