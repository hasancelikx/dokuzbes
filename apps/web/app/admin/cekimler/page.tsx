'use client'

import { useState, useEffect, useCallback } from 'react'
import { Wallet, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react'
import { api, ApiError } from '@/lib/apiClient'

interface CekimTalebi {
  id: string
  goldMiktar: number
  tlMiktar: string
  iban: string
  durum: 'beklemede' | 'onaylandi' | 'reddedildi'
  createdAt: string
  processedAt: string | null
  performer: {
    stageName: string
    user: { email: string; nickname: string | null }
  }
}
interface ListeYanit { talepler: CekimTalebi[]; toplam: number; sayfa: number; toplamSayfa: number }
interface IstatYanit { bekleyen: number; onaylananAdet: number; odenenTL: string | number; reddedilen: number }

const DURUM_CONF = {
  beklemede:   { label: 'Bekliyor',   renk: 'text-yellow-400', bg: 'bg-yellow-400/10',  badge: 'border-yellow-500/30' },
  onaylandi:   { label: 'Ödendi',     renk: 'text-green-400',  bg: 'bg-green-400/10',   badge: 'border-green-500/30'  },
  reddedildi:  { label: 'Reddedildi', renk: 'text-red-400',    bg: 'bg-red-400/10',     badge: 'border-red-500/30'    },
}

export default function AdminCekimlerPage() {
  const [talepler, setTalepler] = useState<CekimTalebi[]>([])
  const [istat, setIstat] = useState<IstatYanit | null>(null)
  const [filtre, setFiltre] = useState<string>('')
  const [yukleniyor, setYukleniyor] = useState(true)
  const [islem, setIslem] = useState<string | null>(null)
  const [redModal, setRedModal] = useState<{ id: string; isim: string } | null>(null)
  const [redSebep, setRedSebep] = useState('')

  const yukle = useCallback(async () => {
    setYukleniyor(true)
    try {
      const [liste, istatVeri] = await Promise.all([
        api.cekim.get<ListeYanit>(`/cekim/admin${filtre ? `?durum=${filtre}` : ''}`),
        api.cekim.get<IstatYanit>('/cekim/admin/istatistik'),
      ])
      setTalepler(liste.talepler)
      setIstat(istatVeri)
    } catch { }
    finally { setYukleniyor(false) }
  }, [filtre])

  useEffect(() => { yukle() }, [yukle])

  async function onayla(id: string) {
    setIslem(id)
    try {
      await api.cekim.patch(`/cekim/admin/${id}/onayla`)
      await yukle()
    } catch (err) {
      alert(err instanceof ApiError ? err.code : 'Onaylama başarısız')
    } finally { setIslem(null) }
  }

  async function reddet() {
    if (!redModal) return
    setIslem(redModal.id)
    try {
      await api.cekim.patch(`/cekim/admin/${redModal.id}/reddet`, { sebep: redSebep })
      setRedModal(null)
      setRedSebep('')
      await yukle()
    } catch (err) {
      alert(err instanceof ApiError ? err.code : 'Red başarısız')
    } finally { setIslem(null) }
  }

  const filtreTablar = [
    { value: '',           label: 'Tümü'    },
    { value: 'beklemede',  label: 'Bekliyor' },
    { value: 'onaylandi',  label: 'Ödendi'   },
    { value: 'reddedildi', label: 'Reddedildi' },
  ]

  return (
    <div className="p-6 space-y-6">

      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wallet size={20} className="text-[#d4af37]" />
          <h1 className="text-xl font-bold text-white">Çekim Talepleri</h1>
        </div>
        <button onClick={yukle} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <RefreshCw size={14} className={yukleniyor ? 'animate-spin' : ''} />Yenile
        </button>
      </div>

      {/* İstatistik kartları */}
      {istat && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Bekleyen',     value: istat.bekleyen,      suffix: 'talep', renk: 'text-yellow-400' },
            { label: 'Toplam Ödenen', value: `₺${Number(istat.odenenTL).toFixed(2)}`, suffix: '', renk: 'text-green-400' },
            { label: 'Onaylanan',    value: istat.onaylananAdet, suffix: 'adet',  renk: 'text-green-400' },
            { label: 'Reddedilen',   value: istat.reddedilen,    suffix: 'adet',  renk: 'text-red-400'   },
          ].map(({ label, value, suffix, renk }) => (
            <div key={label} className="bg-[#12121a] border border-white/10 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-2xl font-bold ${renk}`}>{value}</p>
              {suffix && <p className="text-xs text-gray-600 mt-0.5">{suffix}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Filtre tabları */}
      <div className="flex gap-1.5 bg-[#12121a] border border-white/10 rounded-xl p-1 w-fit">
        {filtreTablar.map(({ value, label }) => (
          <button key={value} onClick={() => setFiltre(value)}
            className={[
              'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
              filtre === value
                ? 'bg-[#d4af37]/15 text-[#d4af37]'
                : 'text-gray-500 hover:text-white',
            ].join(' ')}>
            {label}
          </button>
        ))}
      </div>

      {/* Tablo */}
      <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden">
        {yukleniyor ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : talepler.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-2">
            <Wallet size={28} className="text-gray-700" />
            <p className="text-gray-500 text-sm">Talep bulunamadı</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {['Performer', 'IBAN', 'Miktar', 'TL', 'Durum', 'Tarih', 'İşlem'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {talepler.map((t, i) => {
                const conf = DURUM_CONF[t.durum]
                return (
                  <tr key={t.id}
                    className={['transition-colors', i < talepler.length - 1 ? 'border-b border-white/5' : '', 'hover:bg-white/3'].join(' ')}>
                    <td className="px-4 py-3.5">
                      <p className="text-white font-medium">{t.performer.stageName}</p>
                      <p className="text-gray-600 text-xs">{t.performer.user.email}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-gray-400 font-mono text-xs tracking-wide">{t.iban}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[#d4af37] font-semibold">{t.goldMiktar.toLocaleString('tr-TR')} 🪙</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-white font-semibold">₺{t.tlMiktar}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={['text-xs font-medium px-2 py-1 rounded-full border', conf.bg, conf.renk, conf.badge].join(' ')}>
                        {conf.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs">
                      {new Date(t.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-4 py-3.5">
                      {t.durum === 'beklemede' && (
                        <div className="flex gap-2">
                          <button onClick={() => onayla(t.id)}
                            disabled={islem === t.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-medium hover:bg-green-500/20 disabled:opacity-50 transition-colors">
                            <CheckCircle2 size={12} />Onayla
                          </button>
                          <button onClick={() => setRedModal({ id: t.id, isim: t.performer.stageName })}
                            disabled={islem === t.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-medium hover:bg-red-500/20 disabled:opacity-50 transition-colors">
                            <XCircle size={12} />Reddet
                          </button>
                        </div>
                      )}
                      {t.durum !== 'beklemede' && t.processedAt && (
                        <span className="text-gray-600 text-xs">
                          {new Date(t.processedAt).toLocaleDateString('tr-TR')}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Red modal */}
      {redModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-white/15 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-white font-semibold">Talebi Reddet</h3>
            <p className="text-gray-400 text-sm"><strong className="text-white">{redModal.isim}</strong> için çekim talebi reddedilecek. Gold iade edilecek.</p>
            <textarea
              value={redSebep}
              onChange={e => setRedSebep(e.target.value)}
              placeholder="Red sebebi (opsiyonel)..."
              rows={3}
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/40 resize-none"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setRedModal(null); setRedSebep('') }}
                className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white border border-white/10 hover:bg-white/5 transition-colors">
                İptal
              </button>
              <button onClick={reddet} disabled={!!islem}
                className="px-4 py-2 rounded-lg text-sm bg-red-500/15 border border-red-500/30 text-red-400 font-medium hover:bg-red-500/25 disabled:opacity-50 transition-colors">
                Reddet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
