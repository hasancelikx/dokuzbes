import { FastifyInstance } from 'fastify'
import { tokenDogrula } from '@dokuzbes/auth-middleware'
import { avatarYukle } from '../lib/minio'
import { db } from '../lib/db'
import { AppError } from '@dokuzbes/errors'

export async function avatarRoutes(app: FastifyInstance) {
  app.post('/users/me/avatar', { preHandler: tokenDogrula }, async (req, reply) => {
    const data = await req.file()
    if (!data) throw new AppError('DOSYA_YOK', 422)

    const izinliTipler = ['image/jpeg', 'image/png', 'image/webp']
    if (!izinliTipler.includes(data.mimetype)) {
      throw new AppError('GECERSIZ_DOSYA_TIPI', 422)
    }

    const buffer = await data.toBuffer()

    // Max 2MB
    if (buffer.length > 2 * 1024 * 1024) {
      throw new AppError('DOSYA_COK_BUYUK', 422)
    }

    const url = await avatarYukle(buffer, data.mimetype)

    await db.user.update({
      where: { id: req.kullanici.userId },
      data: { avatarUrl: url },
    })

    return { avatarUrl: url }
  })
}
