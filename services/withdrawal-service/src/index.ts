import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import { cekimRoutes } from './routes/cekim'
import { adminCekimRoutes } from './routes/admin'
import { AppError } from '@dokuzbes/errors'
import { db } from './lib/db'

const app = Fastify({ logger: true })

app.register(cors, {
  origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  credentials: true,
})
app.register(cookie)

app.register(cekimRoutes)
app.register(adminCekimRoutes)

app.setErrorHandler((error, _req, reply) => {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({ code: error.code, message: error.message })
  }
  if (error.validation) {
    return reply.status(400).send({ code: 'GECERSIZ_ISTEK', message: error.message })
  }
  app.log.error(error)
  reply.status(500).send({ code: 'SUNUCU_HATASI' })
})

app.get('/health', async () => ({ status: 'ok', service: 'withdrawal-service' }))

async function baslat() {
  await db.$connect()
  const port = Number(process.env.PORT ?? 3012)
  await app.listen({ port, host: '0.0.0.0' })
  console.log(`withdrawal-service → http://localhost:${port}`)
}

baslat().catch(console.error)
