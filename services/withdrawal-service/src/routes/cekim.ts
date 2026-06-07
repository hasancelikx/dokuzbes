import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { tokenDogrula } from '@dokuzbes/auth-middleware'
import { AppError } from '@dokuzbes/errors'
import { db } from '../lib/db'

// 1 gold = 0.10 TL (min 500 gold = 50 TL)
const GOLD_TL_KURU = Number(process.env.GOLD_TL_KURU ?? '0.10')
const MIN_CEKIM_GOLD = 500

const talepSchema = z.object({
  goldMiktar: z.number().int().min(MIN_CEKIM_GOLD),
  iban: z.string().min(15).max(34).regex(/^TR\d{24}$/, 'Geçersiz IBAN formatı (TR + 24 rakam)'),
})

export async function cekimRoutes(app: FastifyInstance) {
  // Çekim talebi oluştur
  app.post('/cekim/talep', { preHandler: tokenDogrula }, async (req, reply) => {
    if (req.kullanici.role !== 'performer') throw new AppError('YETKISIZ', 403)

    const body = talepSchema.parse(req.body)
    const tlMiktar = (body.goldMiktar * GOLD_TL_KURU).toFixed(2)

    const performer = await db.performer.findUnique({
      where: { userId: req.kullanici.userId },
      select: { id: true, user: { select: { gold: true } } },
    })
    if (!performer) throw new AppError('PERFORMER_BULUNAMADI', 404)
    if (performer.user.gold < body.goldMiktar) throw new AppError('YETERSIZ_GOLD', 400)

    // Beklemedeki talep var mı?
    const mevcutTalep = await db.cekimTalebi.findFirst({
      where: { performerId: performer.id, durum: 'beklemede' },
    })
    if (mevcutTalep) throw new AppError('BEKLEYEN_TALEP_VAR', 409)

    const [talep] = await db.$transaction([
      db.cekimTalebi.create({
        data: {
          performerId: performer.id,
          goldMiktar: body.goldMiktar,
          tlMiktar,
          iban: body.iban,
        },
      }),
      db.user.update({
        where: { id: req.kullanici.userId },
        data: { gold: { decrement: body.goldMiktar } },
      }),
    ])

    return reply.status(201).send({ talep, mesaj: `${body.goldMiktar} gold rezerve edildi` })
  })

  // Performer'ın çekim geçmişi
  app.get('/cekim/gecmis', { preHandler: tokenDogrula }, async (req) => {
    if (req.kullanici.role !== 'performer') throw new AppError('YETKISIZ', 403)

    const performer = await db.performer.findUnique({
      where: { userId: req.kullanici.userId },
      select: { id: true },
    })
    if (!performer) throw new AppError('PERFORMER_BULUNAMADI', 404)

    const talepler = await db.cekimTalebi.findMany({
      where: { performerId: performer.id },
      orderBy: { createdAt: 'desc' },
    })
    return { talepler, kur: GOLD_TL_KURU, minCekim: MIN_CEKIM_GOLD }
  })

  // Çekim iptal et (sadece beklemedeyse)
  app.delete('/cekim/:id', { preHandler: tokenDogrula }, async (req, reply) => {
    if (req.kullanici.role !== 'performer') throw new AppError('YETKISIZ', 403)
    const { id } = req.params as { id: string }

    const performer = await db.performer.findUnique({
      where: { userId: req.kullanici.userId },
      select: { id: true },
    })
    if (!performer) throw new AppError('PERFORMER_BULUNAMADI', 404)

    const talep = await db.cekimTalebi.findUnique({ where: { id } })
    if (!talep || talep.performerId !== performer.id) throw new AppError('TALEP_BULUNAMADI', 404)
    if (talep.durum !== 'beklemede') throw new AppError('IPTAL_EDILEMEZ', 400)

    await db.$transaction([
      db.cekimTalebi.delete({ where: { id } }),
      db.user.update({
        where: { id: req.kullanici.userId },
        data: { gold: { increment: talep.goldMiktar } },
      }),
    ])
    return reply.send({ mesaj: 'Talep iptal edildi, gold iade edildi' })
  })
}
