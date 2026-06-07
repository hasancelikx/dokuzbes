// Masa türlerine göre gold maliyetleri
export const MASA_FIYAT: Record<string, number> = {
  kisa:  50,   // 5 dakika
  uzun:  120,  // 15 dakika
  ozel:  250,  // 30 dakika
}

export const MASA_SURE: Record<string, number> = {
  kisa:  5 * 60,   // saniye
  uzun:  15 * 60,
  ozel:  30 * 60,
}
