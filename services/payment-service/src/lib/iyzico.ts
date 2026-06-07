import Iyzipay from 'iyzipay'

export const iyzico = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY ?? 'sandbox-api-key',
  secretKey: process.env.IYZICO_SECRET_KEY ?? 'sandbox-secret-key',
  uri: process.env.IYZICO_URI ?? 'https://sandbox-api.iyzipay.com',
})

// Gold paketleri — TL fiyatları
export const GOLD_PAKETLERI = [
  { id: 'paket_100',  gold: 100,  fiyatTL: '14.99', bonus: 0 },
  { id: 'paket_250',  gold: 250,  fiyatTL: '34.99', bonus: 10 },
  { id: 'paket_500',  gold: 500,  fiyatTL: '64.99', bonus: 30 },
  { id: 'paket_1000', gold: 1000, fiyatTL: '119.99', bonus: 100 },
  { id: 'paket_2500', gold: 2500, fiyatTL: '279.99', bonus: 300 },
  { id: 'paket_5000', gold: 5000, fiyatTL: '499.99', bonus: 750 },
] as const

export type GoldPaketId = typeof GOLD_PAKETLERI[number]['id']

export function paketBul(paketId: string) {
  return GOLD_PAKETLERI.find((p) => p.id === paketId) ?? null
}
