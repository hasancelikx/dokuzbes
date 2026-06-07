import { api } from '@/lib/apiClient'

export interface HediyeGonderSonucu {
  basarili: boolean
  kalanGold: number
}

export async function hediyeleriGetir() {
  const { hediyeler } = await api.gold.get<{ hediyeler: unknown[] }>('/gold/hediyeler')
  return hediyeler
}

export async function hediyeGonder(
  hediyeId: string,
  masaId: string,
  performerId: string,
): Promise<HediyeGonderSonucu> {
  return api.gold.post<HediyeGonderSonucu>('/gold/hediye-gonder', { hediyeId, masaId, performerId })
}
