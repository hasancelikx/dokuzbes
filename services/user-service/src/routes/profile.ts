import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '../lib/db'
import { tokenDogrula } from '@dokuzbes/auth-middleware'
import { AppError } from '@dokuzbes/errors'

export async function profileRoutes(app: FastifyInstance) {
  // Kendi profilini getir
  app.get('/users/me', { preHandler: tokenDogrula }, async (req) => {
    const kullanici = await db.user.findUnique({
      where: { id: req.kullanici.userId },
      select: {
        id: true, email: true, nickname: true, city: true,
        avatarUrl: true, gold: true, vipLevel: true,
        totalSpent: true, status: true, createdAt: true,
      },
    })
    if (!kullanici) throw new AppError('KULLANICI_BULUNAMADI', 404)
    return kullanici
  })

  // Profil güncelle
  const guncellemeSchema = z.object({
    nickname: z.string().min(2).max(30).optional(),
    city: z.string().max(50).optional(),
  })

  app.patch('/users/me', { preHandler: tokenDogrula }, async (req, reply) => {
    const veri = guncellemeSchema.safeParse(req.body)
    if (!veri.success) {
      return reply.status(422).send({ code: 'GECERSIZ_VERI', errors: veri.error.flatten() })
    }

    if (veri.data.nickname) {
      const mevcut = await db.user.findUnique({ where: { nickname: veri.data.nickname } })
      if (mevcut && mevcut.id !== req.kullanici.userId) {
        throw new AppError('NICKNAME_KULLANILIYOR', 409)
      }
    }

    const guncellendi = await db.user.update({
      where: { id: req.kullanici.userId },
      data: veri.data,
      select: { id: true, nickname: true, city: true, avatarUrl: true },
    })

    return guncellendi
  })

  // Kullanıcıyı id ile getir (public profil)
  app.get('/users/:id', async (req) => {
    const { id } = req.params as { id: string }
    const kullanici = await db.user.findUnique({
      where: { id },
      select: { id: true, nickname: true, avatarUrl: true, vipLevel: true, createdAt: true },
    })
    if (!kullanici) throw new AppError('KULLANICI_BULUNAMADI', 404)
    return kullanici
  })
}
