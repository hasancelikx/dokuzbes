import { FastifyInstance } from 'fastify'
import { tokenDogrula, roleCheck } from '@dokuzbes/auth-middleware'
import { db } from '../lib/db'
import { AppError } from '@dokuzbes/errors'

export async function kullanicilarRoute(app: FastifyInstance) {
  // Kullanıcı listesi
  app.get('/admin/kullanicilar', { preHandler: [tokenDogrula, roleCheck('admin')] }, async (req) => {
    const { sayfa = '1', ara } = req.query as { sayfa?: string; ara?: string }
    const limit = 20
    const offset = (Number(sayfa) - 1) * limit

    const where = ara ? {
      OR: [
        { email: { contains: ara, mode: 'insensitive' as const } },
        { nickname: { contains: ara, mode: 'insensitive' as const } },
      ],
    } : {}

    const [kullanicilar, toplam] = await Promise.all([
      db.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true, email: true, nickname: true, role: true,
          gold: true, status: true, createdAt: true, lastSeen: true,
        },
      }),
      db.user.count({ where }),
    ])

    return { kullanicilar, toplam, sayfa: Number(sayfa), toplamSayfa: Math.ceil(toplam / limit) }
  })

  // Kullanıcı ban
  app.patch('/admin/kullanicilar/:id/ban', { preHandler: [tokenDogrula, roleCheck('admin')] }, async (req) => {
    const { id } = req.params as { id: string }
    const kullanici = await db.user.findUnique({ where: { id } })
    if (!kullanici) throw new AppError('KULLANICI_YOK', 404)
    if (kullanici.role === 'admin') throw new AppError('ADMIN_BANLANAMAZ', 403)

    await db.user.update({ where: { id }, data: { status: 'banned' } })
    return { basarili: true }
  })

  // Ban kaldır
  app.patch('/admin/kullanicilar/:id/unban', { preHandler: [tokenDogrula, roleCheck('admin')] }, async (req) => {
    const { id } = req.params as { id: string }
    await db.user.update({ where: { id }, data: { status: 'active' } })
    return { basarili: true }
  })

  // Gold ekle/çıkar
  app.patch('/admin/kullanicilar/:id/gold', { preHandler: [tokenDogrula, roleCheck('admin')] }, async (req) => {
    const { id } = req.params as { id: string }
    const { miktar } = req.body as { miktar: number }
    if (!miktar || typeof miktar !== 'number') throw new AppError('GECERSIZ_MIKTAR', 400)

    const guncellendi = await db.user.update({
      where: { id },
      data: { gold: { increment: miktar } },
      select: { id: true, nickname: true, gold: true },
    })
    return guncellendi
  })
}
