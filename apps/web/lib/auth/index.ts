import { api, ApiError } from '@/lib/apiClient'
import type { DBUser } from '@/types/user'

export async function girisYap(email: string, password: string): Promise<DBUser> {
  return api.auth.post<DBUser>('/auth/login', { email, password })
}

export async function kayitOl(email: string, password: string, nickname?: string): Promise<DBUser> {
  return api.auth.post<DBUser>('/auth/register', { email, password, ...(nickname ? { nickname } : {}) })
}

export async function cikisYap(): Promise<void> {
  await api.auth.post('/auth/logout')
}

export async function benimKimim(): Promise<DBUser | null> {
  try {
    return await api.auth.get<DBUser>('/auth/me')
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null
    throw err
  }
}
