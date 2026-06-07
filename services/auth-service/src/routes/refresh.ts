import { FastifyInstance } from 'fastify'
import { refreshTokenDogrula, accessTokenUret, karalistedeMi } from '../lib/token'
import { AppError } from '@dokuzbes/errors'

export async function refreshRoute(app: FastifyInstance) {
  app.post('/auth/refresh', async (req, reply) => {
    const token = req.cookies?.refresh_token
    if (!token) throw new AppError('TOKEN_YOK', 401)

    if (await karalistedeMi(token)) throw new AppError('TOKEN_GECERSIZ', 401)

    const payload = refreshTokenDogrula(token)
    const accessToken = accessTokenUret(payload.userId, payload.role)

    reply
      .setCookie('access_token', accessToken, {
        httpOnly: true, secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', maxAge: 60 * 15, path: '/',
      })
      .send({ ok: true })
  })
}
