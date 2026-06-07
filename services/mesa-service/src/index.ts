import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import { masaAcRoute } from './routes/masaAc'
import { masaKabulRoute } from './routes/masaKabul'
import { masaBekleyenRoute } from './routes/masaBekleyen'
import { AppError } from '@dokuzbes/errors'
import { db } from './lib/db'

const app = Fastify({ logger: true })

app.register(cors, {
  origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  credentials: true,
})
app.register(cookie)
app.register(masaAcRoute)
app.register(masaKabulRoute)
app.register(masaBekleyenRoute)

app.setErrorHandler((error, _req, reply) => {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({ code: error.code, message: error.message })
  }
  app.log.error(error)
  reply.status(500).send({ code: 'SUNUCU_HATASI' })
})

app.get('/health', async () => ({ status: 'ok', service: 'mesa-service' }))

async function baslat() {
  await db.$connect()
  const port = Number(process.env.PORT ?? 3004)
  await app.listen({ port, host: '0.0.0.0' })
  console.log(`mesa-service → http://localhost:${port}`)
}

baslat().catch(console.error)
