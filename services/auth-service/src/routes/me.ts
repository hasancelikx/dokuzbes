import { FastifyInstance } from 'fastify'
import { accessTokenDogrula, karalistedeMi } from '../lib/token'
import { db } from '../lib/db'
import { AppError } from '@dokuzbes/errors'

export async function meRoute(app: FastifyInstance) {
  app.get('/auth/me', async (req, reply) => {
    const token = req.cookies?.access_token
    if (!token) throw new AppError('TOKEN_YOK', 401)

    if (await karalistedeMi(token)) throw new AppError('TOKEN_GECERSIZ', 401)

    const payload = accessTokenDogrula(token)

    const kullanici = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true, email: true, nickname: true, role: true,
        gold: true, avatarUrl: true, vipLevel: true, status: true,
      },
    })

    if (!kullanici) throw new AppError('KULLANICI_BULUNAMADI', 404)
    if (kullanici.status === 'banned') throw new AppError('HESAP_BANDI', 403)

    reply.send(kullanici)
  })
}
