export type UserRole = 'customer' | 'performer' | 'admin'

export interface DBUser {
  id: string
  email: string | null
  nickname: string | null
  city?: string | null
  avatarUrl?: string | null
  gold: number
  vipLevel?: number | null
  totalSpent?: number
  role: UserRole
  status?: string | null
  createdAt?: string
}
