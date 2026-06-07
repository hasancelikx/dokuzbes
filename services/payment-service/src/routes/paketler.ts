import { FastifyInstance } from 'fastify'
import { GOLD_PAKETLERI } from '../lib/iyzico'

export async function paketlerRoute(app: FastifyInstance) {
  // GET /payment/paketler — gold paket listesi (auth gerekmez, herkes görebilir)
  app.get('/payment/paketler', async () => {
    return {
      paketler: GOLD_PAKETLERI.map((p) => ({
        ...p,
        toplamGold: p.gold + p.bonus,
        aciklama: p.bonus > 0 ? `${p.gold} gold + ${p.bonus} bonus` : `${p.gold} gold`,
      })),
    }
  })
}
