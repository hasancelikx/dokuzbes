import { FastifyReply } from 'fastify'

// userId → aktif SSE reply listesi
const baglantilar = new Map<string, FastifyReply[]>()

export function baglantiEkle(userId: string, reply: FastifyReply) {
  const mevcut = baglantilar.get(userId) ?? []
  mevcut.push(reply)
  baglantilar.set(userId, mevcut)
}

export function baglantiKaldir(userId: string, reply: FastifyReply) {
  const mevcut = baglantilar.get(userId) ?? []
  const filtrelendi = mevcut.filter((r) => r !== reply)
  if (filtrelendi.length === 0) {
    baglantilar.delete(userId)
  } else {
    baglantilar.set(userId, filtrelendi)
  }
}

export function kullaniciyaGonder(userId: string, veri: object) {
  const hedefler = baglantilar.get(userId)
  if (!hedefler || hedefler.length === 0) return

  const mesaj = `data: ${JSON.stringify(veri)}\n\n`
  for (const reply of hedefler) {
    try {
      reply.raw.write(mesaj)
    } catch {
      // Bağlantı kapanmış olabilir
    }
  }
}

export function aktifBaglantiSayisi() {
  let toplam = 0
  for (const liste of baglantilar.values()) toplam += liste.length
  return toplam
}
