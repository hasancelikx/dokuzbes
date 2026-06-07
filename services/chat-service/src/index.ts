import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import websocket from '@fastify/websocket'
import Redis from 'ioredis'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { db } from './lib/db'

const app = Fastify({ logger: true })

const pub = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379')
const sub = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379')

// masaId → bağlı WebSocket listesi
const odalar = new Map<string, Set<any>>()

app.register(cors, {
  origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  credentials: true,
})
app.register(cookie)
app.register(websocket)

const mesajSchema = z.object({
  tip: z.literal('mesaj'),
  masaId: z.string().uuid(),
  metin: z.string().min(1).max(200),
})

app.register(async (fastify) => {
  fastify.get('/chat', { websocket: true }, async (socket, req) => {
    // Token doğrula
    const token = req.cookies?.access_token
    if (!token) {
      socket.send(JSON.stringify({ hata: 'TOKEN_YOK' }))
      socket.close()
      return
    }

    let kullanici: { userId: string; role: string }
    try {
      kullanici = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as any
    } catch {
      socket.send(JSON.stringify({ hata: 'TOKEN_GECERSIZ' }))
      socket.close()
      return
    }

    let aktifMasaId: string | null = null

    socket.on('message', async (raw: Buffer) => {
      try {
        const veri = mesajSchema.parse(JSON.parse(raw.toString()))

        // Masa var mı ve kullanıcı bu masada mı?
        const masa = await db.masa.findUnique({ where: { id: veri.masaId } })
        if (!masa || masa.durum !== 'aktif') {
          socket.send(JSON.stringify({ hata: 'MASA_AKTIF_DEGIL' }))
          return
        }

        const yayinci = await db.performer.findFirst({
          where: { userId: kullanici.userId }
        })
        const yetki = masa.musteriId === kullanici.userId ||
          (yayinci && masa.yayinciId === yayinci.id)
        if (!yetki) {
          socket.send(JSON.stringify({ hata: 'YETKISIZ' }))
          return
        }

        // Mesajı DB'ye kaydet
        const mesaj = await db.mesaj.create({
          data: {
            masaId: veri.masaId,
            gondericiId: kullanici.userId,
            metin: veri.metin,
          },
          include: { gonderici: { select: { nickname: true, avatarUrl: true } } },
        })

        // Odaya katıl
        aktifMasaId = veri.masaId
        if (!odalar.has(veri.masaId)) odalar.set(veri.masaId, new Set())
        odalar.get(veri.masaId)!.add(socket)

        // Redis PubSub ile yayınla
        await pub.publish(`masa:${veri.masaId}`, JSON.stringify({
          tip: 'mesaj',
          mesaj: {
            id: mesaj.id,
            metin: mesaj.metin,
            gonderici: mesaj.gonderici,
            createdAt: mesaj.createdAt,
          },
        }))

      } catch (err) {
        socket.send(JSON.stringify({ hata: 'GECERSIZ_MESAJ' }))
      }
    })

    socket.on('close', () => {
      if (aktifMasaId) {
        odalar.get(aktifMasaId)?.delete(socket)
      }
    })
  })
})

// Redis mesajlarını dinle ve odadaki tüm socket'lara ilet
sub.psubscribe('masa:*', (err) => {
  if (err) console.error('Redis subscribe hatası:', err)
})

sub.on('pmessage', (_pattern, channel, message) => {
  const masaId = channel.replace('masa:', '')
  const socketler = odalar.get(masaId)
  if (!socketler) return

  socketler.forEach((socket) => {
    if (socket.readyState === 1) {
      socket.send(message)
    }
  })
})

// Geçmiş mesajlar
app.get('/chat/gecmis/:masaId', async (req, reply) => {
  const token = (req as any).cookies?.access_token
  if (!token) return reply.status(401).send({ hata: 'TOKEN_YOK' })
  let kullanici: { userId: string }
  try { kullanici = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as any }
  catch { return reply.status(401).send({ hata: 'TOKEN_GECERSIZ' }) }

  const { masaId } = req.params as { masaId: string }
  const masa = await db.masa.findUnique({ where: { id: masaId } })
  if (!masa) return reply.status(404).send({ hata: 'MASA_YOK' })

  const yayinci = await db.performer.findFirst({ where: { userId: kullanici.userId } })
  const yetki = masa.musteriId === kullanici.userId || (yayinci && masa.yayinciId === yayinci.id)
  if (!yetki) return reply.status(403).send({ hata: 'YETKISIZ' })

  const mesajlar = await db.mesaj.findMany({
    where: { masaId },
    orderBy: { createdAt: 'asc' },
    take: 100,
    include: { gonderici: { select: { id: true, nickname: true, avatarUrl: true } } },
  })
  return { mesajlar }
})

app.get('/health', async () => ({ status: 'ok', service: 'chat-service' }))

async function baslat() {
  await db.$connect()
  const port = Number(process.env.PORT ?? 3005)
  await app.listen({ port, host: '0.0.0.0' })
  console.log(`chat-service → http://localhost:${port}`)
  console.log(`WebSocket   → ws://localhost:${port}/chat`)
}

baslat().catch(console.error)
