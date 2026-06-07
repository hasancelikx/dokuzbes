import { FastifyInstance } from 'fastify'
import jwt from 'jsonwebtoken'
import { db } from '../lib/db'

export async function listRoutes(app: FastifyInstance) {
  // Kendi performer profilini getir
  app.get('/performers/me', async (req, reply) => {
    const token = (req as any).cookies?.access_token
    if (!token) return reply.status(401).send({ code: 'TOKEN_YOK' })
    let payload: { userId: string }
    try { payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as any }
    catch { return reply.status(401).send({ code: 'TOKEN_GECERSIZ' }) }

    const p = await db.performer.findUnique({
      where: { userId: payload.userId },
      select: {
        id: true, stageName: true, bio: true, category: true, city: true,
        durum: true, toplamHediye: true, toplamGorusme: true,
        aktifIzleyici: true, puan: true, vipSeviye: true,
      },
    })
    if (!p) return reply.status(404).send({ code: 'PERFORMER_YOK' })
    return { ...p, puan: Number(p.puan) }
  })

  // Online yayıncıları listele
  app.get('/performers', async (req) => {
    const { kategori, ara, sehir, durum, sayfa = '1' } = req.query as {
      kategori?: string; ara?: string; sehir?: string; durum?: string; sayfa?: string
    }
    const limit = 20
    const offset = (Number(sayfa) - 1) * limit

    const where: any = {
      ...(durum ? { durum } : { durum: { in: ['online', 'musait', 'mesgul'] } }),
      ...(kategori ? { category: kategori } : {}),
      ...(sehir ? { city: { contains: sehir, mode: 'insensitive' } } : {}),
      ...(ara ? { stageName: { contains: ara, mode: 'insensitive' } } : {}),
    }

    const [sonuclar, toplam] = await Promise.all([
      db.performer.findMany({
        where,
        include: { user: { select: { nickname: true, avatarUrl: true } } },
        orderBy: [{ aktifIzleyici: 'desc' }, { puan: 'desc' }],
        take: limit,
        skip: offset,
      }),
      db.performer.count({ where }),
    ])

    const yayincilar = sonuclar.map(({ user, stageName, puan, ...rest }) => ({
      ...rest,
      displayName: stageName,
      avatarUrl: user.avatarUrl,
      puan: Number(puan),
    }))

    return { yayincilar, toplam, sayfa: Number(sayfa), toplamSayfa: Math.ceil(toplam / limit) }
  })

  // Yayıncı profilini getir
  app.get('/performers/:id', async (req) => {
    const { id } = req.params as { id: string }
    const yayinci = await db.performer.findUnique({
      where: { id },
      include: { user: { select: { nickname: true, avatarUrl: true, createdAt: true } } },
    })
    if (!yayinci) return { code: 'YAYINCI_BULUNAMADI' }

    const { user, stageName, puan, ...rest } = yayinci
    return {
      ...rest,
      displayName: stageName,
      avatarUrl: user.avatarUrl,
      puan: Number(puan),
      createdAt: user.createdAt,
    }
  })
}
