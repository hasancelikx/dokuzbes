import { FastifyInstance } from 'fastify'
import { db } from '../lib/db'
import { tokenDogrula, roleCheck } from '@dokuzbes/auth-middleware'
import { AppError } from '@dokuzbes/errors'

export async function masaBekleyenRoute(app: FastifyInstance) {
  // Yayıncının bekleyen masaları (polling için)
  app.get('/mesa/bekleyen', { preHandler: [tokenDogrula, roleCheck('performer')] }, async (req) => {
    const yayinci = await db.performer.findUnique({
      where: { userId: req.kullanici.userId },
    })
    if (!yayinci) throw new AppError('YAYINCI_BULUNAMADI', 404)

    const masalar = await db.masa.findMany({
      where: { yayinciId: yayinci.id, durum: 'waiting' },
      orderBy: { id: 'asc' },
      include: {
        musteri: { select: { nickname: true, avatarUrl: true, vipLevel: true } },
      },
    })

    return { masalar }
  })
}
