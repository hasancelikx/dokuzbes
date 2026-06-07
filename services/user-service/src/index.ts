import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import { profileRoutes } from './routes/profile'
import { avatarRoutes } from './routes/avatar'
import { nicknameCheckRoute } from './routes/nicknameCheck'
import { musteriSiramaRoutes } from './routes/siralama'
import { AppError } from '@dokuzbes/errors'
import { db } from './lib/db'

const app = Fastify({ logger: true })

app.register(cors, {
  origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  credentials: true,
})
app.register(cookie)
app.register(multipart, { limits: { fileSize: 2 * 1024 * 1024 } })

app.register(profileRoutes)
app.register(avatarRoutes)
app.register(nicknameCheckRoute)
app.register(musteriSiramaRoutes)

app.setErrorHandler((error, _req, reply) => {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({ code: error.code, message: error.message })
  }
  app.log.error(error)
  reply.status(500).send({ code: 'SUNUCU_HATASI' })
})

app.get('/health', async () => ({ status: 'ok', service: 'user-service' }))

async function baslat() {
  await db.$connect()
  const port = Number(process.env.PORT ?? 3002)
  await app.listen({ port, host: '0.0.0.0' })
  console.log(`user-service → http://localhost:${port}`)
}

baslat().catch(console.error)
