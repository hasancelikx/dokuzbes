import { api } from '@/lib/apiClient'

export interface GoldBakiyeSonucu {
  gold: number
  nickname: string | null
}

export async function goldBakiyesiGetir(): Promise<GoldBakiyeSonucu> {
  return api.gold.get<GoldBakiyeSonucu>('/gold/bakiye')
}

export async function goldGecmisiGetir() {
  const { islemler } = await api.gold.get<{ islemler: unknown[] }>('/gold/gecmis')
  return islemler
}
