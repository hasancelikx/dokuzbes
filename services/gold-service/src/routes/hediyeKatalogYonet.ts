import { FastifyInstance } from 'fastify'
import { tokenDogrula, roleCheck } from '@dokuzbes/auth-middleware'
import { db } from '../lib/db'
import { AppError } from '@dokuzbes/errors'
import { z } from 'zod'

const katalogEkleSchema = z.object({
  isim: z.string().min(1).max(50),
  ikon: z.string().min(1),
  goldMaliyet: z.number().int().min(1),
  animasyon: z.string().optional(),
  kategori: z.string().optional(),
})

export async function hediyeKatalogYonetRoute(app: FastifyInstance) {
  // POST /gold/admin/hediye — yeni hediye ekle (admin only)
  app.post('/gold/admin/hediye', { preHandler: [tokenDogrula, roleCheck('admin')] }, async (req: any) => {
    const parsed = katalogEkleSchema.safeParse(req.body)
    if (!parsed.success) throw new AppError('GECERSIZ_VERI', 400)

    const hediye = await db.hediyeKatalog.create({ data: parsed.data })
    return { hediye }
  })

  // PATCH /gold/admin/hediye/:id — güncelle
  app.patch('/gold/admin/hediye/:id', { preHandler: [tokenDogrula, roleCheck('admin')] }, async (req: any) => {
    const parsed = katalogEkleSchema.partial().safeParse(req.body)
    if (!parsed.success) throw new AppError('GECERSIZ_VERI', 400)

    const hediye = await db.hediyeKatalog.update({
      where: { id: req.params.id },
      data: parsed.data,
    })
    return { hediye }
  })

  // DELETE /gold/admin/hediye/:id — pasife al (soft delete)
  app.delete('/gold/admin/hediye/:id', { preHandler: [tokenDogrula, roleCheck('admin')] }, async (req: any) => {
    await db.hediyeKatalog.update({
      where: { id: req.params.id },
      data: { aktif: false },
    })
    return { basarili: true }
  })
}
