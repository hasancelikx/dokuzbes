import { FastifyInstance } from 'fastify'
import { tokenDogrula, roleCheck } from '@dokuzbes/auth-middleware'
import { db } from '../lib/db'
import { AppError } from '@dokuzbes/errors'
import { z } from 'zod'

const redSchema = z.object({ neden: z.string().min(5).max(200) })

export async function basvurularRoute(app: FastifyInstance) {
  // Tüm başvurular
  app.get('/admin/basvurular', { preHandler: [tokenDogrula, roleCheck('admin')] }, async (req) => {
    const { durum = 'beklemede' } = req.query as { durum?: string }

    const basvurular = await db.performerApplication.findMany({
      where: durum === 'hepsi' ? {} : { durum },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, nickname: true, createdAt: true } },
      },
    })
    return { basvurular }
  })

  // Başvuru onayla → performer oluştur
  app.patch('/admin/basvurular/:id/onayla', { preHandler: [tokenDogrula, roleCheck('admin')] }, async (req) => {
    const { id } = req.params as { id: string }

    const basvuru = await db.performerApplication.findUnique({ where: { id } })
    if (!basvuru) throw new AppError('BASVURU_YOK', 404)
    if (basvuru.durum !== 'beklemede') throw new AppError('BASVURU_ISLENDI', 409)

    // Atomik: başvuruyu onayla + performer oluştur + kullanıcı rolünü güncelle
    await db.$transaction([
      db.performerApplication.update({
        where: { id },
        data: { durum: 'onaylandi' },
      }),
      db.performer.create({
        data: {
          userId: basvuru.userId,
          stageName: basvuru.stageName,
          bio: basvuru.bio,
          city: basvuru.city,
          category: basvuru.category,
          durum: 'offline',
        },
      }),
      db.user.update({
        where: { id: basvuru.userId },
        data: { role: 'performer' },
      }),
    ])

    return { basarili: true, mesaj: 'Başvuru onaylandı, performer hesabı oluşturuldu.' }
  })

  // Başvuru reddet
  app.patch('/admin/basvurular/:id/reddet', { preHandler: [tokenDogrula, roleCheck('admin')] }, async (req) => {
    const { id } = req.params as { id: string }

    const parsed = redSchema.safeParse(req.body)
    if (!parsed.success) throw new AppError('GECERSIZ_VERI', 400)

    const basvuru = await db.performerApplication.findUnique({ where: { id } })
    if (!basvuru) throw new AppError('BASVURU_YOK', 404)
    if (basvuru.durum !== 'beklemede') throw new AppError('BASVURU_ISLENDI', 409)

    await db.performerApplication.update({
      where: { id },
      data: { durum: 'reddedildi' },
    })

    return { basarili: true }
  })
}
