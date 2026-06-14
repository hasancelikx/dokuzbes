import { FastifyInstance } from 'fastify'
import { tokenDogrula } from '@dokuzbes/auth-middleware'
import { db } from '../lib/db'
import { AppError } from '@dokuzbes/errors'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function performerVar(performerId: string) {
  if (!UUID_RE.test(performerId)) throw new AppError('GECERSIZ_ID', 400)
  const p = await db.performer.findUnique({ where: { id: performerId }, select: { id: true } })
  if (!p) throw new AppError('PERFORMER_YOK', 404)
}

export async function takipRoutes(app: FastifyInstance) {
  // Takip durumu + toplam takipçi sayısı
  app.get('/takip/:performerId/durum', { preHandler: tokenDogrula }, async (req: any) => {
    const { performerId } = req.params
    if (!UUID_RE.test(performerId)) throw new AppError('GECERSIZ_ID', 400)
    const [kayit, takipSayisi] = await Promise.all([
      db.takip.findUnique({
        where: { takipciId_performerId: { takipciId: req.kullanici.userId, performerId } },
        select: { id: true },
      }),
      db.takip.count({ where: { performerId } }),
    ])
    return { takipEdiliyor: !!kayit, takipSayisi }
  })

  // Takip et (idempotent)
  app.post('/takip/:performerId', { preHandler: tokenDogrula }, async (req: any) => {
    const { performerId } = req.params
    await performerVar(performerId)
    await db.takip.upsert({
      where: { takipciId_performerId: { takipciId: req.kullanici.userId, performerId } },
      update: {},
      create: { takipciId: req.kullanici.userId, performerId },
    })
    const takipSayisi = await db.takip.count({ where: { performerId } })
    return { takipEdiliyor: true, takipSayisi }
  })

  // Takipten çık (idempotent)
  app.delete('/takip/:performerId', { preHandler: tokenDogrula }, async (req: any) => {
    const { performerId } = req.params
    if (!UUID_RE.test(performerId)) throw new AppError('GECERSIZ_ID', 400)
    await db.takip.deleteMany({ where: { takipciId: req.kullanici.userId, performerId } })
    const takipSayisi = await db.takip.count({ where: { performerId } })
    return { takipEdiliyor: false, takipSayisi }
  })
}
