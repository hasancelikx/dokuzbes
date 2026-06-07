import { FastifyInstance } from 'fastify'
import { tokenDogrula } from '@dokuzbes/auth-middleware'
import { db } from '../lib/db'
import { AppError } from '@dokuzbes/errors'

export async function odemeGecmisRoute(app: FastifyInstance) {
  // GET /payment/gecmis — kullanıcının ödeme geçmişi
  app.get('/payment/gecmis', { preHandler: tokenDogrula }, async (req: any) => {
    const odemeler = await db.processedPayment.findMany({
      where: { userId: req.kullanici.userId },
      orderBy: { processedAt: 'desc' },
      take: 20,
      select: {
        paymentId: true,
        paketId: true,
        goldEklendi: true,
        processedAt: true,
      },
    })
    return { odemeler }
  })

  // GET /payment/admin/gecmis — tüm ödemeler (admin)
  app.get('/payment/admin/gecmis', { preHandler: tokenDogrula }, async (req: any) => {
    if (req.kullanici.role !== 'admin') throw new AppError('YETKISIZ', 403)

    const odemeler = await db.processedPayment.findMany({
      orderBy: { processedAt: 'desc' },
      take: 100,
      include: {
        user: { select: { nickname: true, email: true } },
      },
    })
    return { odemeler }
  })
}
