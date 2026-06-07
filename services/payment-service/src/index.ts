import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import { paketlerRoute } from './routes/paketler'
import { satinAlRoute } from './routes/satinAl'
import { odemeGecmisRoute } from './routes/odemeGecmis'
import { AppError } from '@dokuzbes/errors'
import { redis } from './lib/redis'
import { db } from './lib/db'

const app = Fastify({ logger: true })

app.register(cors, {
  origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  credentials: true,
})

app.register(cookie)

app.register(paketlerRoute)
app.register(satinAlRoute)
app.register(odemeGecmisRoute)

app.setErrorHandler((error, _req, reply) => {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({ code: error.code, message: error.message })
  }
  app.log.error(error)
  reply.status(500).send({ code: 'SUNUCU_HATASI' })
})

app.get('/health', async () => ({ status: 'ok', service: 'payment-service' }))

async function baslat() {
  await redis.connect()
  await db.$connect()

  const port = Number(process.env.PORT ?? 3008)
  await app.listen({ port, host: '0.0.0.0' })
  console.log(`payment-service → http://localhost:${port}`)
}

baslat().catch(console.error)
