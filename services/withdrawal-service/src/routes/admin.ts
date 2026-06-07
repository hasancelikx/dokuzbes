import { FastifyInstance } from 'fastify'
import { tokenDogrula } from '@dokuzbes/auth-middleware'
import { AppError } from '@dokuzbes/errors'
import { db } from '../lib/db'

export async function adminCekimRoutes(app: FastifyInstance) {
  // Tüm çekim taleplerini listele
  app.get('/cekim/admin', { preHandler: tokenDogrula }, async (req, reply) => {
    if (req.kullanici.role !== 'admin') throw new AppError('YETKISIZ', 403)

    const { durum, sayfa = '1' } = req.query as { durum?: string; sayfa?: string }
    const limit = 20
    const offset = (Number(sayfa) - 1) * limit

    const where = durum ? { durum } : {}

    const [talepler, toplam] = await Promise.all([
      db.cekimTalebi.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          performer: {
            select: {
              stageName: true,
              user: { select: { email: true, nickname: true } },
            },
          },
        },
      }),
      db.cekimTalebi.count({ where }),
    ])

    return { talepler, toplam, sayfa: Number(sayfa), toplamSayfa: Math.ceil(toplam / limit) }
  })

  // Onayla — gold kalıcı olarak düşülmüş, ödeme gerçekleşti
  app.patch('/cekim/admin/:id/onayla', { preHandler: tokenDogrula }, async (req, reply) => {
    if (req.kullanici.role !== 'admin') throw new AppError('YETKISIZ', 403)
    const { id } = req.params as { id: string }

    const talep = await db.cekimTalebi.findUnique({ where: { id } })
    if (!talep) throw new AppError('TALEP_BULUNAMADI', 404)
    if (talep.durum !== 'beklemede') throw new AppError('ZATEN_ISLENDI', 400)

    const guncellendi = await db.cekimTalebi.update({
      where: { id },
      data: { durum: 'onaylandi', processedAt: new Date() },
    })
    return { talep: guncellendi }
  })

  // Reddet — gold iade et
  app.patch('/cekim/admin/:id/reddet', { preHandler: tokenDogrula }, async (req, reply) => {
    if (req.kullanici.role !== 'admin') throw new AppError('YETKISIZ', 403)
    const { id } = req.params as { id: string }
    const { sebep } = (req.body ?? {}) as { sebep?: string }

    const talep = await db.cekimTalebi.findUnique({
      where: { id },
      include: { performer: { select: { userId: true } } },
    })
    if (!talep) throw new AppError('TALEP_BULUNAMADI', 404)
    if (talep.durum !== 'beklemede') throw new AppError('ZATEN_ISLENDI', 400)

    const [guncellendi] = await db.$transaction([
      db.cekimTalebi.update({
        where: { id },
        data: { durum: 'reddedildi', processedAt: new Date() },
      }),
      db.user.update({
        where: { id: talep.performer.userId },
        data: { gold: { increment: talep.goldMiktar } },
      }),
    ])
    return { talep: guncellendi, mesaj: 'Gold iade edildi' }
  })

  // Özet istatistik
  app.get('/cekim/admin/istatistik', { preHandler: tokenDogrula }, async (req) => {
    if (req.kullanici.role !== 'admin') throw new AppError('YETKISIZ', 403)

    const [bekleyen, onaylanan, reddedilen] = await Promise.all([
      db.cekimTalebi.count({ where: { durum: 'beklemede' } }),
      db.cekimTalebi.aggregate({ where: { durum: 'onaylandi' }, _sum: { tlMiktar: true }, _count: true }),
      db.cekimTalebi.count({ where: { durum: 'reddedildi' } }),
    ])

    return {
      bekleyen,
      onaylananAdet: onaylanan._count,
      odenenTL: onaylanan._sum.tlMiktar ?? 0,
      reddedilen,
    }
  })
}
