// Kutlama tetikleyicileri — anlamlı anlarda efekt oynatır.
// Dinleyiciler: <KutlamaKatmani /> (şampanya) + <HediyeKatmani /> (hediye animasyonu),
// her ikisi de (main) layout'ta monteli.

// Genel şampanya patlaması (ör. zaman aralıklı kutlama)
export function kutlamaPatlat() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('db:kutlama'))
  }
}

export interface HediyeDetay {
  emoji: string
  isim: string
  kategori?: string | null
  gold?: number
  gonderen?: string
}

// Hediye geldiğinde amaca özel hediye animasyonu (DBHediyeAnimasyon)
export function hediyePatlat(detay: HediyeDetay) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<HediyeDetay>('db:hediye', { detail: detay }))
  }
}
