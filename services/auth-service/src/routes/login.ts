import { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '../lib/db'
import { accessTokenUret, refreshTokenUret } from '../lib/token'
import { AppError } from '@dokuzbes/errors'

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export async function loginRoute(app: FastifyInstance) {
  app.post('/auth/login', async (req, reply) => {
    const veri = schema.safeParse(req.body)
    if (!veri.success) {
      return reply.status(422).send({ code: 'GECERSIZ_VERI' })
    }

    const { email, password } = veri.data

    const kullanici = await db.user.findUnique({ where: { email } })
    if (!kullanici || !kullanici.passwordHash) {
      throw new AppError('GECERSIZ_KIMLIK', 401)
    }

    if (kullanici.status === 'banned') throw new AppError('HESAP_BANDI', 403)

    const sifreEslesiyor = await bcrypt.compare(password, kullanici.passwordHash)
    if (!sifreEslesiyor) throw new AppError('GECERSIZ_KIMLIK', 401)

    const accessToken = accessTokenUret(kullanici.id, kullanici.role)
    const refreshToken = refreshTokenUret(kullanici.id, kullanici.role)

    await db.user.update({
      where: { id: kullanici.id },
      data: { lastSeen: new Date() },
    })

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
