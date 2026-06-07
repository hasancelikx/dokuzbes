import { FastifyInstance } from 'fastify'
import { tokenDogrula, roleCheck } from '@dokuzbes/auth-middleware'
import { db } from '../lib/db'

export async function istatistiklerRoute(app: FastifyInstance) {
  app.get('/admin/istatistikler', { preHandler: [tokenDogrula, roleCheck('admin')] }, async () => {
    const [
      toplamKullanici,
      toplamPerformer,
      bekleyenBasvuru,
      toplamMasa,
      aktifMasa,
      banliKullanici,
    ] = await Promise.all([
      db.user.count(),
      db.performer.count(),
      db.performerApplication.count({ where: { durum: 'beklemede' } }),
      db.masa.count(),
      db.masa.count({ where: { durum: 'aktif' } }),
      db.user.count({ where: { status: 'banned' } }),
    ])

    return {
      toplamKullanici,
      toplamPerformer,
      bekleyenBasvuru,
      toplamMasa,
      aktifMasa,
      banliKullanici,
    }
  })
}
