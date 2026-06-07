import { FastifyInstance } from 'fastify'
import { db } from '../lib/db'

type Donem = 'haftalik' | 'aylik' | 'tumzaman'

function donemBaslangic(donem: Donem): Date | null {
  const now = new Date()
  if (donem === 'haftalik') {
    const d = new Date(now)
    d.setDate(d.getDate() - 7)
    return d
  }
  if (donem === 'aylik') {
    const d = new Date(now)
    d.setDate(d.getDate() - 30)
    return d
  }
  return null
}

export async function siramaRoutes(app: FastifyInstance) {
  // Top 10 performer by hediye aldı
  app.get('/performers/siralama', async (req) => {
    const { donem = 'haftalik' } = req.query as { donem?: Donem }
    const baslangic = donemBaslangic(donem as Donem)

    if (donem === 'tumzaman') {
      const sonuclar = await db.performer.findMany({
        orderBy: { toplamHediye: 'desc' },
        take: 10,
        select: {
          id: true,
          stageName: true,
          toplamHediye: true,
          aktifIzleyici: true,
          puan: true,
          city: true,
          vipSeviye: true,
          durum: true,
          user: { select: { nickname: true, avatarUrl: true } },
        },
      })
      return {
        siralama: sonuclar.map((p, i) => ({
          sira: i + 1,
          id: p.id,
          isim: p.stageName,
          avatarUrl: p.user.avatarUrl,
          hediye: p.toplamHediye,
          izleyici: p.aktifIzleyici,
          puan: Number(p.puan),
          sehir: p.city,
          vipSeviye: p.vipSeviye,
          durum: p.durum,
        })),
        donem,
      }
    }

    // Dönemsel — HediyeGonderimi aggregate
    const toplamlar = await db.hediyeGonderimi.groupBy({
      by: ['aliciId'],
      where: { createdAt: { gte: baslangic! } },
      _sum: { goldMaliyet: true },
      orderBy: { _sum: { goldMaliyet: 'desc' } },
      take: 10,
    })

    if (toplamlar.length === 0) {
      return { siralama: [], donem }
    }

    const idler = toplamlar.map(t => t.aliciId)
    const performerlar = await db.performer.findMany({
      where: { id: { in: idler } },
      select: {
        id: true,
        stageName: true,
        aktifIzleyici: true,
        puan: true,
        city: true,
        vipSeviye: true,
        durum: true,
        user: { select: { nickname: true, avatarUrl: true } },
      },
    })
    const pMap = Object.fromEntries(performerlar.map(p => [p.id, p]))

    return {
      siralama: toplamlar.map((t, i) => {
        const p = pMap[t.aliciId]
        return {
          sira: i + 1,
          id: t.aliciId,
          isim: p?.stageName ?? '—',
          avatarUrl: p?.user.avatarUrl ?? null,
          hediye: t._sum.goldMaliyet ?? 0,
          izleyici: p?.aktifIzleyici ?? 0,
          puan: Number(p?.puan ?? 0),
          sehir: p?.city ?? null,
          vipSeviye: p?.vipSeviye ?? 1,
          durum: p?.durum ?? 'offline',
        }
      }),
      donem,
    }
  })
}
