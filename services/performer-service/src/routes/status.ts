import { FastifyInstance } from 'fastify'
import { tokenDogrula, roleCheck } from '@dokuzbes/auth-middleware'
import { db } from '../lib/db'
import { redis } from '../lib/redis'
import { AppError } from '@dokuzbes/errors'
import { z } from 'zod'

const durumlar = ['online', 'offline', 'mesgul', 'molada'] as const

export async function statusRoutes(app: FastifyInstance) {
  // Durum güncelle (heartbeat)
  app.put('/performers/me/status',
    { preHandler: [tokenDogrula, roleCheck('performer')] },
    async (req) => {
      const { durum } = z.object({ durum: z.enum(durumlar) }).parse(req.body)

      const yayinci = await db.performer.findUnique({
        where: { userId: req.kullanici.userId },
      })
      if (!yayinci) throw new AppError('YAYINCI_BULUNAMADI', 404)

      await db.performer.update({
        where: { id: yayinci.id },
        data: { durum },
      })

      // Redis'e de yaz — 90 saniye TTL (heartbeat kesilirse offline sayılır)
      if (durum === 'offline') {
        await redis.del(`performer:status:${yayinci.id}`)
      } else {
        await redis.setex(`performer:status:${yayinci.id}`, 90, durum)
      }

      return { ok: true, durum }
    }
  )

  // Kendi performerprofilini getir
  app.get('/performers/me',
    { preHandler: [tokenDogrula, roleCheck('performer')] },
    async (req) => {
      const yayinci = await db.performer.findUnique({
        where: { userId: req.kullanici.userId },
        include: { user: { select: { email: true, nickname: true, avatarUrl: true } } },
      })
      if (!yayinci) throw new AppError('YAYINCI_BULUNAMADI', 404)
      return yayinci
    }
  )
}
