import { FastifyInstance } from 'fastify'
import { tokenKaraliste } from '../lib/token'

export async function logoutRoute(app: FastifyInstance) {
  app.post('/auth/logout', async (req, reply) => {
    const accessToken = req.cookies?.access_token
    const refreshToken = req.cookies?.refresh_token

    if (accessToken) await tokenKaraliste(accessToken)
    if (refreshToken) await tokenKaraliste(refreshToken)

    reply
      .clearCookie('access_token', { path: '/' })
      .clearCookie('refresh_token', { path: '/auth/refresh' })
      .send({ ok: true })
  })
}
