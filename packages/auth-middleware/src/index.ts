import { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'
import Redis from 'ioredis'
import { AppError } from '@dokuzbes/errors'

export interface JwtPayload {
  userId: string
  role: string
  type: 'access' | 'refresh'
}

declare module 'fastify' {
  interface FastifyRequest {
    kullanici: JwtPayload
  }
}

const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379')

export async function tokenDogrula(req: FastifyRequest, reply: FastifyReply) {
  const token = req.cookies?.access_token
  if (!token) throw new AppError('TOKEN_YOK', 401)

  const karalistede = await redis.get(`blacklist:${token}`)
  if (karalistede) throw new AppError('TOKEN_GECERSIZ', 401)

  const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload
  req.kullanici = payload
}

export function roleCheck(...roles: string[]) {
  return async (req: FastifyRequest, _reply: FastifyReply) => {
    if (!roles.includes(req.kullanici.role)) {
      throw new AppError('YETKISIZ', 403)
    }
  }
}
