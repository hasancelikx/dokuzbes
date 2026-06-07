import { FastifyInstance } from 'fastify'
import { tokenDogrula, roleCheck } from '@dokuzbes/auth-middleware'
import { db } from '../lib/db'
import { AppError } from '@dokuzbes/errors'

export async function performerYonetRoute(app: FastifyInstance) {
  // Tüm performerlar
  app.get('/admin/performerlar', { preHandler: [tokenDogrula, roleCheck('admin')] }, async (req) => {
    const { sayfa = '1' } = req.query as { sayfa?: string }
    const limit = 20
    const offset = (Number(sayfa) - 1) * limit

    const [performerlar, toplam] = await Promise.all([
      db.performer.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: { user: { select: { email: true, nickname: true, status: true } } },
      }),
      db.performer.count(),
    ])

    return { performerlar, toplam }
  })

  // Performer durum güncelle (online/offline/banned)
  app.patch('/admin/performerlar/:id/durum', { preHandler: [tokenDogrula, roleCheck('admin')] }, async (req) => {
    const { id } = req.params as { id: string }
    const { durum } = req.body as { durum: string }

    const gecerliDurumlar = ['online', 'offline', 'musait', 'molada']
    if (!gecerliDurumlar.includes(durum)) throw new AppError('GECERSIZ_DURUM', 400)

    const guncellendi = await db.performer.update({
      where: { id },
      data: { durum },
      select: { id: true, stageName: true, durum: true },
    })
    return guncellendi
  })

  // Performer sil (role'ü customer'a döndür)
  app.delete('/admin/performerlar/:id', { preHandler: [tokenDogrula, roleCheck('admin')] }, async (req) => {
    const { id } = req.params as { id: string }

    const performer = await db.performer.findUnique({ where: { id } })
    if (!performer) throw new AppError('PERFORMER_YOK', 404)

    await db.$transaction([
      db.performer.delete({ where: { id } }),
      db.user.update({ where: { id: performer.userId }, data: { role: 'customer' } }),
    ])

    return { basarili: true }
  })
}
