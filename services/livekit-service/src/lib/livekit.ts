import { AccessToken, RoomServiceClient } from 'livekit-server-sdk'

const API_KEY = process.env.LIVEKIT_API_KEY!
const API_SECRET = process.env.LIVEKIT_API_SECRET!
const LIVEKIT_HOST = (process.env.LIVEKIT_URL ?? 'ws://localhost:7880')
  .replace('ws://', 'http://')
  .replace('wss://', 'https://')

export const roomService = new RoomServiceClient(LIVEKIT_HOST, API_KEY, API_SECRET)

export async function tokenUret(opts: {
  odaAdi: string
  kimlik: string
  goruntulu: boolean
  sesli: boolean
  yayinci?: boolean
}): Promise<string> {
  const token = new AccessToken(API_KEY, API_SECRET, {
    identity: opts.kimlik,
    ttl: '4h',
  })

  token.addGrant({
    roomJoin: true,
    room: opts.odaAdi,
    canPublish: opts.goruntulu || opts.sesli,
    canSubscribe: true,
    canPublishData: true,
    // Yayıncı odayı yönetebilir (ses kapat vb.)
    roomAdmin: opts.yayinci ?? false,
  })

  return token.toJwt()
}

export async function odaOlustur(odaAdi: string) {
  return roomService.createRoom({
    name: odaAdi,
    emptyTimeout: 300,    // 5 dakika boşsa sil
    maxParticipants: 2,
  })
}

export async function odaSil(odaAdi: string) {
  try {
    await roomService.deleteRoom(odaAdi)
  } catch {
    // Oda zaten silinmiş olabilir
  }
}
