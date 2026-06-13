'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  useLocalParticipant,
  useParticipants,
} from '@livekit/components-react'
import '@livekit/components-styles'
import { api, ApiError } from '@/lib/apiClient'
import { useAuthStore } from '@/store/authStore'
import {
  Mic, MicOff, Video, VideoOff, PhoneOff,
  Send, Gift, ChevronDown, Coins, Clock,
  ArrowLeft, XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { hediyePatlat } from '@/lib/kutlama'

type MasaAsamasi = 'yukleniyor' | 'bekliyor' | 'aktif' | 'reddedildi' | 'hata'

const BEKLEME_SURE = 300 // saniye — mesa-service timeout ile senkron

/* ─── Tipler ─────────────────────────────────────── */
interface MasaToken {
  token: string; odaAdi: string; livekitUrl: string
  rol: 'yayinci' | 'musteri'
  masa: { id: string; tur: string; durum: string; performerAdi: string; musteriAdi: string | null; performerId?: string }
}
interface ChatMesaj {
  id: string; metin: string; createdAt: string
  gonderici: { id: string; nickname: string | null; avatarUrl: string | null }
}
interface HediyeItem { id: string; isim: string; ikon: string; goldMaliyet: number }

const CHAT_WS = process.env.NEXT_PUBLIC_CHAT_URL ?? 'ws://localhost:3005'
const CHAT_HTTP = CHAT_WS.replace(/^ws/, 'http') // ws://→http://, wss://→https://

/* ─── Hediye Drawer ──────────────────────────────── */
function HediyeDrawer({
  masaId, performerId, onKapat,
}: { masaId: string; performerId?: string; onKapat: () => void }) {
  const [hediyeler, setHediyeler] = useState<HediyeItem[]>([])
  const [gonderiliyor, setGonderiliyor] = useState<string | null>(null)

  useEffect(() => {
    api.gold.get<{ hediyeler: HediyeItem[] }>('/gold/hediyeler')
      .then(d => setHediyeler(d.hediyeler))
      .catch(() => {})
  }, [])

  async function gonder(hediye: HediyeItem) {
    if (!performerId) return
    setGonderiliyor(hediye.id)
    try {
      await api.gold.post('/gold/hediye-gonder', { hediyeId: hediye.id, masaId, performerId })
      toast.success(`${hediye.isim} gönderildi!`)
      onKapat()
    } catch (e) {
      const code = (e as any)?.code
      if (code === 'YETERSIZ_GOLD') toast.error('Yetersiz gold.')
      else toast.error('Hediye gönderilemedi.')
    } finally {
      setGonderiliyor(null)
    }
  }

  return (
    <div className="absolute bottom-20 left-0 right-0 bg-[#12121a]/95 backdrop-blur border-t border-white/10 rounded-t-2xl p-4 z-20">
      <div className="flex items-center justify-between mb-4">
        <span className="text-white font-semibold">Hediye Gönder</span>
        <button onClick={onKapat} className="text-gray-400 hover:text-white">
          <ChevronDown size={20} />
        </button>
      </div>
      {hediyeler.length === 0 ? (
        <p className="text-center text-gray-500 py-4 text-sm">Yükleniyor...</p>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {hediyeler.map(h => (
            <button
              key={h.id}
              onClick={() => gonder(h)}
              disabled={gonderiliyor === h.id}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-[rgba(201,168,76,0.12)] border border-white/5 hover:border-[rgba(201,168,76,0.3)] transition-all disabled:opacity-50"
            >
              <span className="text-2xl">{h.ikon}</span>
              <span className="text-[10px] text-gray-400">{h.isim}</span>
              <span className="text-[10px] text-[#C9A84C] font-semibold flex items-center gap-0.5">
                <Coins size={9} />{h.goldMaliyet}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Chat Paneli ────────────────────────────────── */
function ChatPanel({
  masaId, mevcutUserId, ws,
}: { masaId: string; mevcutUserId: string; ws: WebSocket | null }) {
  const [mesajlar, setMesajlar] = useState<ChatMesaj[]>([])
  const [metin, setMetin] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  // Geçmişi yükle
  useEffect(() => {
    fetch(`${CHAT_HTTP}/chat/gecmis/${masaId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.mesajlar) setMesajlar(d.mesajlar) })
      .catch(() => {})
  }, [masaId])

  // WS mesajları
  useEffect(() => {
    if (!ws) return
    const handler = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data)
        if (data.tip === 'mesaj') {
          setMesajlar(prev => [...prev, data.mesaj])
        } else if (data.tip === 'hediye') {
          hediyePatlat({
            emoji: data.hediyeIkon,
            isim: data.hediyeIsim,
            kategori: data.hediyeKategori,
            gold: data.hediyeGold,
          })
        }
      } catch {}
    }
    ws.addEventListener('message', handler)
    return () => ws.removeEventListener('message', handler)
  }, [ws])

  // Auto-scroll
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [mesajlar])

  function gonder(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!metin.trim() || !ws || ws.readyState !== WebSocket.OPEN) return
    ws.send(JSON.stringify({ tip: 'mesaj', masaId, metin: metin.trim() }))
    setMetin('')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mesaj listesi */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2 min-h-0">
        {mesajlar.length === 0 && (
          <p className="text-center text-gray-600 text-xs py-6">Henüz mesaj yok</p>
        )}
        {mesajlar.map(m => {
          const benim = m.gonderici.id === mevcutUserId
          return (
            <div key={m.id} className={`flex gap-2 ${benim ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                benim ? 'bg-[rgba(201,168,76,0.2)] text-[#C9A84C]' : 'bg-white/10 text-gray-300'
              }`}>
                {(m.gonderici.nickname ?? '?').slice(0, 1).toUpperCase()}
              </div>
              <div className={`max-w-[75%] ${benim ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                <span className="text-[10px] text-gray-500">
                  {m.gonderici.nickname ?? 'Misafir'}
                </span>
                <div className={`px-3 py-1.5 rounded-2xl text-sm leading-snug ${
                  benim
                    ? 'bg-[rgba(201,168,76,0.15)] text-white rounded-tr-sm'
                    : 'bg-white/8 text-gray-200 rounded-tl-sm'
                }`}>
                  {m.metin}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Giriş alanı */}
      <form onSubmit={gonder} className="flex gap-2 px-3 py-3 border-t border-white/8">
        <input
          type="text"
          value={metin}
          onChange={e => setMetin(e.target.value)}
          placeholder="Mesaj yaz..."
          maxLength={200}
          className="flex-1 bg-white/8 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[rgba(201,168,76,0.4)] min-w-0"
        />
        <button
          type="submit"
          disabled={!metin.trim()}
          className="w-9 h-9 rounded-xl bg-[rgba(201,168,76,0.15)] text-[#C9A84C] flex items-center justify-center hover:bg-[rgba(201,168,76,0.25)] disabled:opacity-30 transition-colors shrink-0"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  )
}

/* ─── Kontrol Çubuğu ─────────────────────────────── */
function KontrolCubugu({
  masayiKapat, hediyeAc, sohbetAc, sure,
}: { masayiKapat: () => void; hediyeAc: () => void; sohbetAc: () => void; sure: string }) {
  const { localParticipant } = useLocalParticipant()
  const [sesli, setSesli] = useState(true)
  const [goruntulu, setGoruntulu] = useState(true)
  const [kapatiliyor, setKapatiliyor] = useState(false)

  async function sesToggle() {
    const yeni = !sesli
    await localParticipant.setMicrophoneEnabled(yeni)
    setSesli(yeni)
  }
  async function videoToggle() {
    const yeni = !goruntulu
    await localParticipant.setCameraEnabled(yeni)
    setGoruntulu(yeni)
  }
  async function kapat() {
    setKapatiliyor(true)
    masayiKapat()
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#0d0d14] border-t border-white/8 shrink-0">
      {/* Süre */}
      <div className="flex items-center gap-1.5 text-gray-500 text-xs w-24">
        <Clock size={12} />
        <span className="font-mono">{sure}</span>
      </div>

      {/* Butonlar */}
      <div className="flex items-center gap-3">
        <button onClick={sesToggle}
          className={`p-3 rounded-full transition-colors ${sesli
            ? 'bg-white/10 hover:bg-white/15 text-white'
            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}>
          {sesli ? <Mic size={18} /> : <MicOff size={18} />}
        </button>
        <button onClick={videoToggle}
          className={`p-3 rounded-full transition-colors ${goruntulu
            ? 'bg-white/10 hover:bg-white/15 text-white'
            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}>
          {goruntulu ? <Video size={18} /> : <VideoOff size={18} />}
        </button>
        <button onClick={kapat} disabled={kapatiliyor}
          className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50 scale-110">
          <PhoneOff size={18} />
        </button>
      </div>

      {/* Sağ: Hediye + Sohbet (mobil) */}
      <div className="flex items-center justify-end gap-2 w-24">
        <button onClick={hediyeAc}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[rgba(201,168,76,0.12)] text-[#C9A84C] text-xs font-medium hover:bg-[rgba(201,168,76,0.2)] transition-colors">
          <Gift size={14} />
          <span className="hidden sm:inline">Hediye</span>
        </button>
        <button onClick={sohbetAc}
          className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/8 text-gray-400 text-xs font-medium hover:bg-white/12 transition-colors">
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}

/* ─── Bekleme Ekranı ─────────────────────────────── */
function BeklemeSayfasi({
  performerAdi, tur, geriSayim, onIptal,
}: { performerAdi: string; tur: string; geriSayim: number; onIptal: () => void }) {
  const dk = String(Math.floor(geriSayim / 60)).padStart(2, '0')
  const sn = String(geriSayim % 60).padStart(2, '0')
  const ilerleme = (geriSayim / BEKLEME_SURE) * 100

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-center gap-6 px-4">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="#1a1a28" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="44" fill="none"
            stroke="#C9A84C" strokeWidth="6"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (1 - ilerleme / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-[#C9A84C] font-bold text-lg">{dk}:{sn}</span>
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-[#F0EDE8] text-lg font-semibold">{performerAdi} kabulünü bekliyor...</p>
        <p className="text-[#5A5050] text-sm">
          {tur === 'kisa' ? '5 dk' : tur === 'uzun' ? '15 dk' : '30 dk'} masa isteğiniz gönderildi
        </p>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a28] border border-[rgba(201,168,76,0.15)]">
        <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse" />
        <span className="text-[#A09080] text-xs">Yanıt bekleniyor...</span>
      </div>

      <button
        onClick={onIptal}
        className="flex items-center gap-2 text-[#5A5050] text-sm hover:text-[#A09080] transition-colors mt-2"
      >
        <ArrowLeft size={14} />
        Vazgeç ve geri dön
      </button>
    </div>
  )
}

/* ─── Red / Timeout Ekranı ───────────────────────── */
function ReddedildiEkrani({
  performerAdi, sebep, goldIade, onGeri,
}: { performerAdi: string; sebep: 'red' | 'timeout'; goldIade?: number; onGeri: () => void }) {
  return (
    <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-center gap-6 px-4">
      <div className="w-16 h-16 rounded-full bg-[rgba(139,26,42,0.15)] border border-[rgba(139,26,42,0.35)] flex items-center justify-center">
        <XCircle size={28} className="text-red-400" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-[#F0EDE8] text-lg font-semibold">
          {sebep === 'red' ? 'Masa reddedildi' : 'Zaman doldu'}
        </p>
        <p className="text-[#5A5050] text-sm">
          {sebep === 'red'
            ? `${performerAdi} şu an müsait değil.`
            : `${performerAdi} zamanında yanıt vermedi.`}
        </p>
        {goldIade != null && goldIade > 0 && (
          <p className="text-[#C9A84C] text-sm font-medium">{goldIade} gold bakiyenize iade edildi.</p>
        )}
      </div>
      <button
        onClick={onGeri}
        className="px-6 py-3 bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.3)] text-[#C9A84C] rounded-xl hover:bg-[rgba(201,168,76,0.2)] transition-colors text-sm font-medium"
      >
        Salona Dön
      </button>
    </div>
  )
}

/* ─── Ana Sayfa ──────────────────────────────────── */
export default function MasaSayfasi() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { kullanici } = useAuthStore()
  const [masaToken, setMasaToken] = useState<MasaToken | null>(null)
  const [asama, setAsama] = useState<MasaAsamasi>('yukleniyor')
  const [redSebep, setRedSebep] = useState<'red' | 'timeout'>('red')
  const [hata, setHata] = useState<string | null>(null)
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [hediyeAcik, setHediyeAcik] = useState(false)
  const [mobilSohbet, setMobilSohbet] = useState(false)
  const [sure, setSure] = useState('00:00')
  const [geriSayim, setGeriSayim] = useState(BEKLEME_SURE)
  const baslangicRef = useRef<Date | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Masa durumu poll et — yalnızca 'bekliyor' aşamasında
  const durumKontrol = useCallback(async () => {
    try {
      const mesa = await api.mesa.get<{ durum: string }>(`/mesa/${id}`)
      if (mesa.durum === 'aktif') {
        setAsama('aktif')
        // WebSocket bağlan
        const socket = new WebSocket(`${CHAT_WS}/chat`)
        socket.onopen = () => { setWs(socket); wsRef.current = socket }
        socket.onerror = () => {}
      } else if (mesa.durum === 'iptal' || mesa.durum === 'kapali') {
        setRedSebep('red')
        setAsama('reddedildi')
      }
    } catch { /* sessiz — sonraki iterasyonda tekrar dener */ }
  }, [id])

  useEffect(() => {
    if (asama !== 'bekliyor') return
    const t = setInterval(durumKontrol, 4000)
    return () => clearInterval(t)
  }, [asama, durumKontrol])

  // Geri sayım — yalnızca 'bekliyor' aşamasında
  useEffect(() => {
    if (asama !== 'bekliyor') return
    const t = setInterval(() => {
      setGeriSayim(p => {
        if (p <= 1) {
          setRedSebep('timeout')
          setAsama('reddedildi')
          return 0
        }
        return p - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [asama])

  // Aktif masa sayacı
  useEffect(() => {
    if (asama !== 'aktif') return
    baslangicRef.current = new Date()
    const t = setInterval(() => {
      if (!baslangicRef.current) return
      const s = Math.floor((Date.now() - baslangicRef.current.getTime()) / 1000)
      const dk = String(Math.floor(s / 60)).padStart(2, '0')
      const sn = String(s % 60).padStart(2, '0')
      setSure(`${dk}:${sn}`)
    }, 1000)
    return () => clearInterval(t)
  }, [asama])

  // Token al
  useEffect(() => {
    if (!kullanici) { router.replace('/giris'); return }
    api.livekit.post<MasaToken>('/livekit/token', { masaId: id, goruntulu: true, sesli: true })
      .then(t => {
        setMasaToken(t)
        if (t.masa.durum === 'aktif') {
          // Doğrudan LiveKit'e bağlan
          const socket = new WebSocket(`${CHAT_WS}/chat`)
          socket.onopen = () => { setWs(socket); wsRef.current = socket }
          socket.onerror = () => {}
          setAsama('aktif')
        } else {
          // 'waiting' → bekleme ekranı, poll başlar
          setAsama('bekliyor')
        }
      })
      .catch(e => {
        if (e instanceof ApiError && e.status === 410) setHata('Bu masa kapanmış.')
        else if (e instanceof ApiError && e.status === 403) setHata('Bu masaya erişim yetkiniz yok.')
        else setHata('Bağlantı kurulamadı.')
        setAsama('hata')
      })
    return () => { wsRef.current?.close() }
  }, [id, kullanici]) // eslint-disable-line react-hooks/exhaustive-deps

  async function masayiKapat() {
    wsRef.current?.close()
    try { await api.mesa.post(`/mesa/${id}/kapat`) } catch {}
    router.back()
  }

  async function vazgec() {
    try { await api.mesa.post(`/mesa/${id}/red`) } catch {}
    router.back()
  }

  /* ── Yükleniyor ── */
  if (asama === 'yukleniyor') return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-full border-[3px] border-[#C9A84C] border-t-transparent animate-spin mx-auto" />
        <p className="text-gray-500 text-sm">Bağlantı kuruluyor...</p>
      </div>
    </div>
  )

  /* ── Hata ── */
  if (asama === 'hata' || hata) return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-red-400">{hata ?? 'Bir hata oluştu.'}</p>
        <button onClick={() => router.back()}
          className="px-6 py-3 bg-white/10 rounded-xl text-white hover:bg-white/15 transition-colors">
          Geri Dön
        </button>
      </div>
    </div>
  )

  /* ── Bekleme ── */
  if (asama === 'bekliyor' && masaToken) return (
    <BeklemeSayfasi
      performerAdi={masaToken.masa.performerAdi}
      tur={masaToken.masa.tur}
      geriSayim={geriSayim}
      onIptal={vazgec}
    />
  )

  /* ── Reddedildi / Timeout ── */
  if (asama === 'reddedildi' && masaToken) return (
    <ReddedildiEkrani
      performerAdi={masaToken.masa.performerAdi}
      sebep={redSebep}
      goldIade={undefined}
      onGeri={() => router.push('/salon')}
    />
  )

  if (!masaToken) return null

  const karsiTaraf = masaToken.rol === 'musteri'
    ? masaToken.masa.performerAdi
    : (masaToken.masa.musteriAdi ?? 'Müşteri')

  return (
    <div className="h-screen bg-[#080810] flex flex-col overflow-hidden">

      {/* ── Üst Bar ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0d0d14] border-b border-white/8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[rgba(201,168,76,0.15)] border border-[rgba(201,168,76,0.2)] flex items-center justify-center text-sm font-semibold text-[#C9A84C]">
            {karsiTaraf.slice(0,1)}
          </div>
          <div>
            <p className="text-white text-sm font-medium leading-tight">{karsiTaraf}</p>
            <p className="text-gray-500 text-[10px] capitalize">{masaToken.masa.tur} masa</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-[#C9A84C] bg-[rgba(201,168,76,0.08)] px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
            Canlı
          </span>
        </div>
      </div>

      {/* ── İçerik: Video + Chat ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Video (sol / üst) */}
        <div className="relative flex-1 bg-black min-w-0">
          <LiveKitRoom
            serverUrl={masaToken.livekitUrl}
            token={masaToken.token}
            connect
            video audio
            onDisconnected={masayiKapat}
            style={{ height: '100%' }}
          >
            <VideoConference />
            <RoomAudioRenderer />
            <WaitingOverlay />
            <KontrolCubugu
              masayiKapat={masayiKapat}
              hediyeAc={() => setHediyeAcik(p => !p)}
              sohbetAc={() => setMobilSohbet(p => !p)}
              sure={sure}
            />
            {hediyeAcik && (
              <HediyeDrawer
                masaId={id}
                performerId={masaToken.rol === 'musteri' ? masaToken.masa.performerId : undefined}
                onKapat={() => setHediyeAcik(false)}
              />
            )}
          </LiveKitRoom>
        </div>

        {/* Chat (sağ) — desktop */}
        <div className="hidden lg:flex flex-col w-72 border-l border-white/8 bg-[#0d0d14]">
          <div className="px-4 py-3 border-b border-white/8 shrink-0">
            <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Sohbet</p>
          </div>
          <div className="flex-1 min-h-0">
            <ChatPanel masaId={id} mevcutUserId={kullanici?.id ?? ''} ws={ws} />
          </div>
        </div>
      </div>

      {/* Chat bottom sheet — mobil */}
      {mobilSohbet && (
        <div className="lg:hidden absolute inset-0 z-30 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobilSohbet(false)} />
          <div className="relative flex flex-col bg-[#0d0d14] rounded-t-2xl border-t border-white/10"
            style={{ height: '55%' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 shrink-0">
              <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Sohbet</p>
              <button onClick={() => setMobilSohbet(false)} className="text-gray-600 hover:text-gray-400 text-lg leading-none">×</button>
            </div>
            <div className="flex-1 min-h-0">
              <ChatPanel masaId={id} mevcutUserId={kullanici?.id ?? ''} ws={ws} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function WaitingOverlay() {
  const participants = useParticipants()
  if (participants.length >= 2) return null
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none z-10">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Karşı taraf bekleniyor...</p>
      </div>
    </div>
  )
}
