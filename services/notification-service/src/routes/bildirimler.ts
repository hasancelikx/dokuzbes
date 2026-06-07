import { FastifyInstance } from 'fastify'
import { tokenDogrula } from '@dokuzbes/auth-middleware'
import { db } from '../lib/db'
import { baglantiEkle, baglantiKaldir } from '../lib/sseManager'

export async function bildirimlerRoute(app: FastifyInstance) {
  // SSE bağlantısı — gerçek zamanlı bildirimler
  app.get('/bildirimler/stream', { preHandler: tokenDogrula }, async (req, reply) => {
    const userId = req.kullanici.userId

    reply.raw.setHeader('Content-Type', 'text/event-stream')
    reply.raw.setHeader('Cache-Control', 'no-cache')
    reply.raw.setHeader('Connection', 'keep-alive')
    reply.raw.setHeader('X-Accel-Buffering', 'no')
    reply.raw.flushHeaders()

    // İlk bağlantıda okunmamış sayısını gönder
    const okunmamis = await db.bildirim.count({
      where: { userId, okundu: false },
    })
    reply.raw.write(`data: ${JSON.stringify({ tur: 'BAGLANTI', okunmamis })}\n\n`)

    baglantiEkle(userId, reply)

    // Keep-alive: 25 saniyede bir ping
    const ping = setInterval(() => {
      try {
        reply.raw.write(': ping\n\n')
      } catch {
        clearInterval(ping)
      }
    }, 25_000)

    req.socket.on('close', () => {
      clearInterval(ping)
      baglantiKaldir(userId, reply)
    })

    // Fastify'ın yanıtı bitirmesini engelle
    await new Promise<void>((resolve) => {
      req.socket.on('close', resolve)
    })
  })

  // Bildirim listesi
  app.get('/bildirimler', { preHandler: tokenDogrula }, async (req) => {
    const { sayfa = '1', sadeceokunmamis = 'false' } = req.query as {
      sayfa?: string
      sadeceokunmamis?: string
    }
    const limit = 20
    const offset = (Number(sayfa) - 1) * limit
    const userId = req.kullanici.userId

    const where = {
      userId,
      ...(sadeceokunmamis === 'true' ? { okundu: false } : {}),
    }

    const [bildirimler, toplam, okunmamis] = await Promise.all([
      db.bildirim.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.bildirim.count({ where }),
      db.bildirim.count({ where: { userId, okundu: false } }),
    ])

    return { bildirimler, toplam, okunmamis }
  })

  // Tek bildirimi okundu işaretle
  app.patch('/bildirimler/:id/oku', { preHandler: tokenDogrula }, async (req) => {
    const { id } = req.params as { id: string }
    const userId = req.kullanici.userId

    await db.bildirim.updateMany({
      where: { id, userId },
      data: { okundu: true },
    })
    return { basarili: true }
  })

  // Tümünü okundu işaretle
  app.patch('/bildirimler/tumunu-oku', { preHandler: tokenDogrula }, async (req) => {
    const userId = req.kullanici.userId
    await db.bildirim.updateMany({
      where: { userId, okundu: false },
      data: { okundu: true },
    })
    return { basarili: true }
  })

  // Bildirimi sil
  app.delete('/bildirimler/:id', { preHandler: tokenDogrula }, async (req) => {
    const { id } = req.params as { id: string }
    const userId = req.kullanici.userId
    await db.bildirim.deleteMany({ where: { id, userId } })
    return { basarili: true }
  })
}
