import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import { registerRoute } from './routes/register'
import { loginRoute } from './routes/login'
import { refreshRoute } from './routes/refresh'
import { logoutRoute } from './routes/logout'
import { meRoute } from './routes/me'
import { AppError } from '@dokuzbes/errors'
import { redis } from './lib/redis'
import { db } from './lib/db'

const app = Fastify({ logger: true })

app.register(cors, {
  origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  credentials: true,
})

app.register(cookie)

app.register(registerRoute)
app.register(loginRoute)
app.register(refreshRoute)
app.register(logoutRoute)
app.register(meRoute)

// Genel hata yakalayıcı
app.setErrorHandler((error, _req, reply) => {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({ code: error.code, message: error.message })
  }
  app.log.error(error)
  reply.status(500).send({ code: 'SUNUCU_HATASI' })
})

app.get('/health', async () => ({ status: 'ok', service: 'auth-service' }))

async function baslat() {
  await redis.connect()
  await db.$connect()

  const port = Number(process.env.PORT ?? 3001)
  await app.listen({ port, host: '0.0.0.0' })
  console.log(`auth-service → http://localhost:${port}`)
}

baslat().catch(console.error)
