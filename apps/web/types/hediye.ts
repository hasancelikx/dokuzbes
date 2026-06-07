import type { Timestamp } from 'firebase/firestore'

export interface Hediye {
  id: string
  isim: string
  emoji: string
  goldMaliyet: number
  animasyonTipi: 'ucus' | 'patlama' | 'yagmur'
  kategori: 'temel' | 'orta' | 'premium' | 'luks'
}

export interface GonderilmisHediye {
  id: string
  gondericId: string
  aliciId: string
  hediyeId: string
  goldMaliyet: number
  zaman: Timestamp
}
