import jwt from 'jsonwebtoken'
import { redis } from './redis'

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

export interface JwtPayload {
  userId: string
  role: string
  type: 'access' | 'refresh'
}

export function accessTokenUret(userId: string, role: string): string {
  return jwt.sign({ userId, role, type: 'access' }, ACCESS_SECRET, {
    expiresIn: '15m',
  })
}

export function refreshTokenUret(userId: string, role: string): string {
  return jwt.sign({ userId, role, type: 'refresh' }, REFRESH_SECRET, {
    expiresIn: '7d',
  })
}

export function accessTokenDogrula(token: string): JwtPayload {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload
}

export function refreshTokenDogrula(token: string): JwtPayload {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload
}

export async function tokenKaraliste(token: string): Promise<void> {
  // Token'ın kalan ömrü kadar Redis'te sakla
  const decoded = jwt.decode(token) as { exp?: number }
  if (!decoded?.exp) return
  const ttl = decoded.exp - Math.floor(Date.now() / 1000)
  if (ttl > 0) {
    await redis.setex(`blacklist:${token}`, ttl, '1')
  }
}

export async function karalistedeMi(token: string): Promise<boolean> {
  const sonuc = await redis.get(`blacklist:${token}`)
  return sonuc === '1'
}
