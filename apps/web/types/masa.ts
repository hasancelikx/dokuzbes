import type { Timestamp } from 'firebase/firestore'

export type MasaTuru = 'kisa' | 'uzun' | 'ozel'
export type MasaDurumu = 'aktif' | 'bitti' | 'iptal'

export interface Masa {
  id: string
  musteriId: string
  yayinciId: string
  tur: MasaTuru
  goldMaliyet: number       // Masa başı ödenen
  baslangic: Timestamp
  bitis: Timestamp | null
  sure: number              // Dakika (5/15/30)
  durum: MasaDurumu
}

export interface ChatMesaj {
  id: string
  gondericId: string
  metin: string
  zaman: Timestamp
}

export const MASA_GOLDLERI: Record<MasaTuru, number> = {
  kisa:  50,
  uzun:  120,
  ozel:  250,
}
