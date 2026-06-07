import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import { bildirimlerRoute } from './routes/bildirimler'
import './lib/redisSubscriber' // Redis'i başlat

const app = Fastify({ logger: true })

app.register(cors, {
  origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  credentials: true,
})
app.register(cookie)
app.register(bildirimlerRoute)

app.get('/health', async () => ({
  durum: 'ok',
  servis: 'notification-service',
}))

app.setErrorHandler((err, _req, reply) => {
  const status = (err as any).statusCode ?? 500
  reply.status(status).send({ hata: err.message, kod: (err as any).code ?? 'SUNUCU_HATASI' })
})

const PORT = Number(process.env.PORT ?? 3010)
app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) { app.log.error(err); process.exit(1) }
})
