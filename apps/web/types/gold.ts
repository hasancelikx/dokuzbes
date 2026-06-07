import type { Timestamp } from 'firebase/firestore'

export interface GoldPaketi {
  id: string
  isim: string
  gold: number
  bonusGold: number
  fiyatTL: number
  populer: boolean
}

export const GOLD_PAKETLERI: GoldPaketi[] = [
  { id: 'starter', isim: 'Başlangıç',  gold: 100,  bonusGold: 0,    fiyatTL: 29.99,  populer: false },
  { id: 'popular', isim: 'Popüler',    gold: 500,  bonusGold: 50,   fiyatTL: 119.99, populer: true  },
  { id: 'premium', isim: 'Premium',    gold: 1500, bonusGold: 300,  fiyatTL: 299.99, populer: false },
  { id: 'elite',   isim: 'Elite',      gold: 5000, bonusGold: 1750, fiyatTL: 899.99, populer: false },
]

export interface Transaction {
  id: string
  userId: string
  tur: 'satin_alma' | 'harcama' | 'iade' | 'bonus'
  miktar: number          // + artış, - azalış
  aciklama: string
  zaman: Timestamp
  iyzicoId?: string       // Ödeme referansı
}
