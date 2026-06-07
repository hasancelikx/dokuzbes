import { FastifyInstance } from 'fastify'
import { db } from '../lib/db'

const YASAK = ['admin', 'sistem', 'dokuzbes', 'support', 'moderator', 'bot', 'null', 'undefined']

export async function nicknameCheckRoute(app: FastifyInstance) {
  app.get('/users/nickname-check', async (req, reply) => {
    const { nickname } = req.query as { nickname?: string }

    if (!nickname || nickname.length < 2 || nickname.length > 30) {
      return reply.status(400).send({ musait: false, sebep: 'GECERSIZ_UZUNLUK' })
    }

    if (!/^[a-zA-Z0-9_çğıöşüÇĞİÖŞÜ]+$/.test(nickname)) {
      return reply.status(400).send({ musait: false, sebep: 'GECERSIZ_KARAKTER' })
    }

    if (YASAK.includes(nickname.toLowerCase())) {
      return { musait: false, sebep: 'YASAK_KELIME' }
    }

    const mevcut = await db.user.findFirst({
      where: { nickname: { equals: nickname, mode: 'insensitive' } },
      select: { id: true },
    })

    return { musait: !mevcut }
  })
}
