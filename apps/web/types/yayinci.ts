export type YayinciDurumu = 'online' | 'musait' | 'mesgul' | 'molada' | 'offline'

export interface Yayinci {
  id: string
  userId?: string
  displayName: string
  bio?: string | null
  avatarUrl?: string | null
  city?: string | null
  durum: YayinciDurumu
  aktifIzleyici: number
  toplamGorusme: number
  toplamHediye: number
  puan: number
  vipSeviye: 1 | 2 | 3
  etiketler: string[]
  createdAt?: string
}
