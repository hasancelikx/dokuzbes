import { FastifyInstance } from 'fastify'
import { tokenDogrula } from '@dokuzbes/auth-middleware'
import { db } from '../lib/db'
import { AppError } from '@dokuzbes/errors'
import { z } from 'zod'

const basvuruSchema = z.object({
  stageName: z.string().min(2).max(50),
  bio: z.string().max(500).optional(),
  city: z.string().max(50).optional(),
  category: z.enum(['muzik', 'sohbet', 'dans', 'diger']),
})

export async function applyRoutes(app: FastifyInstance) {
  app.post('/performers/apply', { preHandler: tokenDogrula }, async (req, reply) => {
    const veri = basvuruSchema.safeParse(req.body)
    if (!veri.success) {
      return reply.status(422).send({ code: 'GECERSIZ_VERI', errors: veri.error.flatten() })
    }

    // Zaten yayıncı mı?
    const mevcutYayinci = await db.performer.findFirst({
      where: { userId: req.kullanici.userId },
    })
    if (mevcutYayinci) throw new AppError('ZATEN_YAYINCI', 409)

    // Bekleyen başvuru var mı?
    const bekleyenBasvuru = await db.performerApplication.findFirst({
      where: { userId: req.kullanici.userId, durum: 'beklemede' },
    })
    if (bekleyenBasvuru) throw new AppError('BEKLEYEN_BASVURU_VAR', 409)

    const basvuru = await db.performerApplication.create({
      data: {
        userId: req.kullanici.userId,
        stageName: veri.data.stageName,
        bio: veri.data.bio,
        city: veri.data.city,
        category: veri.data.category,
      },
    })

    return reply.status(201).send({ id: basvuru.id, durum: basvuru.durum })
  })
}
