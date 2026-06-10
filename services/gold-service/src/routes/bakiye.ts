import { FastifyInstance } from 'fastify'
import { tokenDogrula } from '@dokuzbes/auth-middleware'
import { db } from '../lib/db'
import { AppError } from '@dokuzbes/errors'

export async function bakiyeRoute(app: FastifyInstance) {
  // GET /gold/bakiye — kullanıcının gold bakiyesi
  app.get('/gold/bakiye', { preHandler: tokenDogrula }, async (req: any) => {
    const user = await db.user.findUnique({
      where: { id: req.kullanici.userId },
      select: { id: true, gold: true, nickname: true },
    })
    if (!user) throw new AppError('KULLANICI_YOK', 404)

    return { gold: user.gold, nickname: user.nickname }
  })

  // GET /gold/gecmis — son 50 transaction
  app.get('/gold/gecmis', { preHandler: tokenDogrula }, async (req: any) => {
    const islemler = await db.transaction.findMany({
      where: { userId: req.kullanici.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        tur: true,
        miktar: true,
        aciklama: true,
        createdAt: true,
      },
    })

    return { islemler }
  })
}
