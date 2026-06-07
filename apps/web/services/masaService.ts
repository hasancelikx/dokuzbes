import { api } from '@/lib/apiClient'

export interface MasaAcSonucu {
  id: string
  tur: string
  durum: string
  goldMaliyet: number
  musteriId: string
  yayinciId: string
  baslangic: string
}

export interface MasaKapatSonucu {
  basarili: boolean
}

export async function masaAc(performerId: string, tur: 'kisa' | 'uzun' | 'ozel'): Promise<MasaAcSonucu> {
  return api.mesa.post<MasaAcSonucu>('/mesa/ac', { yayinciId: performerId, tur })
}

export async function masaKabul(masaId: string): Promise<void> {
  await api.mesa.post(`/mesa/${masaId}/kabul`)
}

export async function masaRed(masaId: string): Promise<void> {
  await api.mesa.post(`/mesa/${masaId}/red`)
}

export async function masaKapat(masaId: string): Promise<MasaKapatSonucu> {
  return api.mesa.post<MasaKapatSonucu>(`/mesa/${masaId}/kapat`)
}

export async function masaDetay(masaId: string) {
  return api.mesa.get(`/mesa/${masaId}`)
}
