'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Wallet, ArrowLeft, AlertCircle, CheckCircle2, Clock, XCircle, Trash2, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { api, ApiError } from '@/lib/apiClient'

interface CekimTalebi {
  id: string
  goldMiktar: number
  tlMiktar: string
  iban: string
  durum: 'beklemede' | 'onaylandi' | 'reddedildi'
  createdAt: string
  processedAt: string | null
}
interface GecmisYanit { talepler: CekimTalebi[]; kur: number; minCekim: number }

const DURUM_CONF = {
  beklemede:   { label: 'İnceleniyor', renk: 'text-yellow-400',  bg: 'bg-yellow-400/10',  ikon: Clock },
  onaylandi:   { label: 'Ödendi',      renk: 'text-green-400',   bg: 'bg-green-400/10',   ikon: CheckCircle2 },
  reddedildi:  { label: 'Reddedildi',  renk: 'text-red-400',     bg: 'bg-red-400/10',     ikon: XCircle },
}

function ibanFormatla(v: string) {
  const temiz = v.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (!temiz.startsWith('TR') && temiz.length > 0 && !/^[A-Z]/.test(temiz)) {
    return 'TR' + temiz.replace(/^TR/i, '')
  }
  return temiz.slice(0, 26)
}

export default function CekimPage() {
  const router = useRouter()
  const kullanici = useAuthStore(s => s.kullanici)
  const [goldMiktar, setGoldMiktar] = useState('')
  const [iban, setIban] = useState('')
  const [gecmis, setGecmis] = useState<CekimTalebi[]>([])
  const [kur, setKur] = useState(0.1)
  const [minCekim, setMinCekim] = useState(500)
  const [gonderiyor, setGonderiyor] = useState(false)
  const [hata, setHata] = useState('')
  const [basari, setBasari] = useState('')
  const [yukleniyor, setYukleniyor] = useState(true)

  useEffect(() => {
    if (!kullanici || kullanici.role !== 'performer') {
      router.replace('/')
      return
    }
    yukleGecmis()
  }, [kullanici])

  async function yukleGecmis() {
    setYukleniyor(true)
    try {
      const d = await api.cekim.get<GecmisYanit>('/cekim/gecmis')
      setGecmis(d.talepler)
      setKur(d.kur)
      setMinCekim(d.minCekim)
    } catch { }
    finally { setYukleniyor(false) }
  }

  async function talipOl(e: React.FormEvent) {
    e.preventDefault()
    setHata(''); setBasari('')
    const gold = Number(goldMiktar)
    if (isNaN(gold) || gold < minCekim) { setHata(`Minimum ${minCekim} gold gerekiyor`); return }
    if (!iban.match(/^TR\d{24}$/)) { setHata('Geçersiz IBAN (TR + 24 rakam olmalı)'); return }
    setGonderiyor(true)
    try {
      await api.cekim.post('/cekim/talep', { goldMiktar: gold, iban })
      setBasari(`${gold} gold rezerve edildi. İşleminiz inceleniyor.`)
      setGoldMiktar(''); setIban('')
      await yukleGecmis()
    } catch (err) {
      const msg = err instanceof ApiError ? err.code : 'Hata oluştu'
      const MESAJLAR: Record<string, string> = {
        YETERSIZ_GOLD: 'Yetersiz gold bakiyeniz var',
        BEKLEYEN_TALEP_VAR: 'Zaten bekleyen bir talebiniz var',
      }
      setHata(MESAJLAR[msg] ?? msg)
    } finally { setGonderiyor(false) }
  }

  async function iptalEt(id: string) {
    try {
      await api.cekim.delete(`/cekim/${id}`)
      await yukleGecmis()
    } catch (err) {
      alert(err instanceof ApiError ? err.code : 'İptal başarısız')
    }
  }

  const goldSayi = Number(goldMiktar) || 0
  const tlTutar = (goldSayi * kur).toFixed(2)
  const bakiye = kullanici?.gold ?? 0
  const bekleyenTalep = gecmis.find(t => t.durum === 'beklemede')

  return (
    <div className="min-h-screen bg-[#080810]">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* Başlık */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}
            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.2)] flex items-center justify-center">
              <Wallet size={18} className="text-[#C9A84C]" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">Gold Çekimi</h1>
              <p className="text-gray-600 text-xs">1 gold = ₺{kur.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Bakiye kartı */}
        <div className="bg-[rgba(201,168,76,0.07)] border border-[rgba(201,168,76,0.2)] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs mb-1">Mevcut Bakiye</p>
            <p className="text-3xl font-bold text-[#C9A84C]">{bakiye.toLocaleString('tr-TR')}</p>
            <p className="text-gray-600 text-xs mt-0.5">gold</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-xs mb-1">TL Karşılığı</p>
            <p className="text-xl font-semibold text-white">₺{(bakiye * kur).toFixed(2)}</p>
          </div>
        </div>

        {/* Bildirimler */}
        {hata && (
          <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/25 rounded-xl p-3.5">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <p className="text-red-400 text-sm">{hata}</p>
          </div>
        )}
        {basari && (
          <div className="flex items-center gap-2.5 bg-green-500/10 border border-green-500/25 rounded-xl p-3.5">
            <CheckCircle2 size={16} className="text-green-400 shrink-0" />
            <p className="text-green-400 text-sm">{basari}</p>
          </div>
        )}

        {/* Form */}
        {!bekleyenTalep ? (
          <form onSubmit={talipOl} className="bg-[#0f0f18] border border-white/6 rounded-2xl p-5 space-y-4">
            <h2 className="text-white font-semibold text-sm">Yeni Çekim Talebi</h2>

            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Gold Miktarı</label>
              <div className="relative">
                <input
                  type="number"
                  min={minCekim}
                  max={bakiye}
                  value={goldMiktar}
                  onChange={e => setGoldMiktar(e.target.value)}
                  placeholder={`Min. ${minCekim} gold`}
                  className="w-full bg-[#12121e] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[rgba(201,168,76,0.35)] pr-20 transition-colors"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className="text-gray-600 text-xs">🪙</span>
                  {goldSayi >= minCekim && (
                    <span className="text-[#C9A84C] text-xs font-semibold">₺{tlTutar}</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between mt-1.5">
                <p className="text-[11px] text-gray-600">Min: {minCekim} gold (₺{(minCekim * kur).toFixed(0)})</p>
                <button type="button" onClick={() => setGoldMiktar(String(bakiye))}
                  className="text-[11px] text-[#C9A84C] hover:underline">Tümünü çek</button>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">IBAN</label>
              <input
                type="text"
                value={iban}
                onChange={e => setIban(ibanFormatla(e.target.value))}
                placeholder="TR00 0000 0000 0000 0000 0000 00"
                maxLength={26}
                className="w-full bg-[#12121e] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[rgba(201,168,76,0.35)] font-mono tracking-wide transition-colors"
              />
              <p className="text-[11px] text-gray-600 mt-1">TR ile başlayan 26 karakterli IBAN numarası</p>
            </div>

            <button
              type="submit"
              disabled={gonderiyor || !goldMiktar || !iban}
              className="w-full py-3 rounded-xl bg-[#C9A84C] text-black font-bold text-sm hover:bg-[#d4b56a] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              {gonderiyor ? 'Gönderiliyor...' : 'Çekim Talebi Oluştur'}
            </button>
          </form>
        ) : (
          <div className="bg-yellow-500/8 border border-yellow-500/20 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Clock size={18} className="text-yellow-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-white font-semibold text-sm mb-1">Bekleyen Talep Var</p>
                <p className="text-gray-500 text-xs">
                  {bekleyenTalep.goldMiktar.toLocaleString('tr-TR')} gold · ₺{bekleyenTalep.tlMiktar} · {bekleyenTalep.iban}
                </p>
                <p className="text-gray-600 text-xs mt-1">Yeni talep oluşturmadan önce bekleyen talebi iptal edin.</p>
              </div>
              <button onClick={() => iptalEt(bekleyenTalep.id)}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors shrink-0">
                <Trash2 size={13} />İptal
              </button>
            </div>
          </div>
        )}

        {/* Geçmiş */}
        <div>
          <h2 className="text-sm font-semibold text-white mb-3">Geçmiş Talepler</h2>
          {yukleniyor ? (
            <div className="space-y-2">
              {[1,2].map(i => <div key={i} className="h-16 rounded-xl bg-white/4 animate-pulse" />)}
            </div>
          ) : gecmis.length === 0 ? (
            <p className="text-gray-600 text-xs text-center py-8">Henüz talep yok</p>
          ) : (
            <div className="space-y-2">
              {gecmis.map(t => {
                const conf = DURUM_CONF[t.durum]
                const Ikon = conf.ikon
                return (
                  <div key={t.id} className="bg-[#0f0f18] border border-white/6 rounded-xl p-3.5 flex items-center gap-3">
                    <div className={['w-8 h-8 rounded-lg flex items-center justify-center shrink-0', conf.bg].join(' ')}>
                      <Ikon size={15} className={conf.renk} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">
                        {t.goldMiktar.toLocaleString('tr-TR')} gold · <span className="text-[#C9A84C]">₺{t.tlMiktar}</span>
                      </p>
                      <p className="text-gray-600 text-[11px] font-mono truncate mt-0.5">{t.iban}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={['text-[11px] font-medium', conf.renk].join(' ')}>{conf.label}</span>
                      <p className="text-gray-700 text-[10px] mt-0.5">
                        {new Date(t.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
