import { FastifyInstance } from 'fastify'
import { db } from '../lib/db'

type Donem = 'haftalik' | 'aylik' | 'tumzaman'

function donemBaslangic(donem: Donem): Date | null {
  const now = new Date()
  if (donem === 'haftalik') {
    const d = new Date(now); d.setDate(d.getDate() - 7); return d
  }
  if (donem === 'aylik') {
    const d = new Date(now); d.setDate(d.getDate() - 30); return d
  }
  return null
}

export async function musteriSiramaRoutes(app: FastifyInstance) {
  app.get('/users/siralama', async (req) => {
    const { donem = 'haftalik' } = req.query as { donem?: Donem }
    const baslangic = donemBaslangic(donem as Donem)

    if (donem === 'tumzaman') {
      const sonuclar = await db.user.findMany({
        where: { totalSpent: { gt: 0 }, status: 'active' },
        orderBy: { totalSpent: 'desc' },
        take: 10,
        select: {
          id: true,
          nickname: true,
          avatarUrl: true,
          totalSpent: true,
          vipLevel: true,
          city: true,
        },
      })
      return {
        siralama: sonuclar.map((u, i) => ({
          sira: i + 1,
          id: u.id,
          isim: u.nickname ?? 'Misafir',
          avatarUrl: u.avatarUrl,
          harcanan: u.totalSpent,
          vipLevel: u.vipLevel,
          sehir: u.city,
        })),
        donem,
      }
    }

    // Dönemsel — HediyeGonderimi aggregate (gönderici = müşteri)
    const toplamlar = await db.hediyeGonderimi.groupBy({
      by: ['gondericiId'],
      where: { createdAt: { gte: baslangic! } },
      _sum: { goldMaliyet: true },
      orderBy: { _sum: { goldMaliyet: 'desc' } },
      take: 10,
    })

    if (toplamlar.length === 0) return { siralama: [], donem }

    const idler = toplamlar.map(t => t.gondericiId)
    const kullanicilar = await db.user.findMany({
      where: { id: { in: idler } },
      select: {
        id: true,
        nickname: true,
        avatarUrl: true,
        vipLevel: true,
        city: true,
      },
    })
    const uMap = Object.fromEntries(kullanicilar.map(u => [u.id, u]))

    return {
      siralama: toplamlar.map((t, i) => {
        const u = uMap[t.gondericiId]
        return {
          sira: i + 1,
          id: t.gondericiId,
          isim: u?.nickname ?? 'Misafir',
          avatarUrl: u?.avatarUrl ?? null,
          harcanan: t._sum.goldMaliyet ?? 0,
          vipLevel: u?.vipLevel ?? 1,
          sehir: u?.city ?? null,
        }
      }),
      donem,
    }
  })
}
