import { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '../lib/db'
import { accessTokenUret, refreshTokenUret } from '../lib/token'
import { AppError } from '@dokuzbes/errors'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  nickname: z.string().min(2).max(30).optional(),
})

export async function registerRoute(app: FastifyInstance) {
  app.post('/auth/register', async (req, reply) => {
    const veri = schema.safeParse(req.body)
    if (!veri.success) {
      return reply.status(422).send({ code: 'GECERSIZ_VERI', errors: veri.error.flatten() })
    }

    const { email, password, nickname } = veri.data

    const mevcutEmail = await db.user.findUnique({ where: { email } })
    if (mevcutEmail) throw new AppError('EMAIL_KULLANILIYOR', 409)

    if (nickname) {
      const mevcutNickname = await db.user.findUnique({ where: { nickname } })
      if (mevcutNickname) throw new AppError('NICKNAME_KULLANILIYOR', 409)
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const kullanici = await db.user.create({
      data: { email, passwordHash, nickname: nickname ?? null, role: 'customer' },
    })

    const accessToken = accessTokenUret(kullanici.id, kullanici.role)
    const refreshToken = refreshTokenUret(kullanici.id, kullanici.role)

    reply
      .setCookie('access_token', accessToken, {
        httpOnly: true, secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', maxAge: 60 * 15, path: '/',
      })
      .setCookie('refresh_token', refreshToken, {
        httpOnly: true, secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/auth/refresh',
      })
      .send({
        id: kullanici.id,
        email: kullanici.email,
        nickname: kullanici.nickname,
        role: kullanici.role,
        gold: kullanici.gold,
      })
  })
}
