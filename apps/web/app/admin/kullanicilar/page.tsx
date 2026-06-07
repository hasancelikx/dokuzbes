'use client'

import { useEffect, useState, useCallback } from 'react'
import { api, ApiError } from '@/lib/apiClient'
import { Search, Ban, CheckCircle, Coins, ChevronLeft, ChevronRight } from 'lucide-react'

interface Kullanici {
  id: string
  email: string | null
  nickname: string | null
  role: string
  gold: number
  status: string | null
  createdAt: string
}

interface KullanicilarResponse {
  kullanicilar: Kullanici[]
  toplam: number
  sayfa: number
  toplamSayfa: number
}

export default function KullanicilarSayfasi() {
  const [veri, setVeri] = useState<KullanicilarResponse | null>(null)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [sayfa, setSayfa] = useState(1)
  const [arama, setArama] = useState('')
  const [aramaGecici, setAramaGecici] = useState('')
  const [islemId, setIslemId] = useState<string | null>(null)
  const [goldModal, setGoldModal] = useState<Kullanici | null>(null)
  const [goldMiktar, setGoldMiktar] = useState('')
  const [mesaj, setMesaj] = useState<{ tip: 'ok' | 'hata'; metin: string } | null>(null)

  const yukle = useCallback(async () => {
    setYukleniyor(true)
    try {
      const params = new URLSearchParams({ sayfa: String(sayfa) })
      if (arama) params.set('ara', arama)
      const data = await api.admin.get<KullanicilarResponse>(`/admin/kullanicilar?${params}`)
      setVeri(data)
    } catch {
      setMesaj({ tip: 'hata', metin: 'Kullanıcılar yüklenemedi.' })
    } finally {
      setYukleniyor(false)
    }
  }, [sayfa, arama])

  useEffect(() => { yukle() }, [yukle])

  async function banToggle(k: Kullanici) {
    setIslemId(k.id)
    try {
      const endpoint = k.status === 'banned' ? 'unban' : 'ban'
      await api.admin.patch(`/admin/kullanicilar/${k.id}/${endpoint}`)
      setMesaj({ tip: 'ok', metin: k.status === 'banned' ? 'Ban kaldırıldı.' : 'Kullanıcı banlandı.' })
      yukle()
    } catch (e) {
      setMesaj({ tip: 'hata', metin: e instanceof ApiError ? e.message : 'İşlem başarısız.' })
    } finally {
      setIslemId(null)
    }
  }

  async function goldGonder() {
    if (!goldModal || !goldMiktar) return
    const miktar = Number(goldMiktar)
    if (isNaN(miktar)) return
    setIslemId(goldModal.id)
    try {
      await api.admin.patch(`/admin/kullanicilar/${goldModal.id}/gold`, { miktar })
      setMesaj({ tip: 'ok', metin: `${miktar > 0 ? '+' : ''}${miktar} gold uygulandı.` })
      setGoldModal(null)
      setGoldMiktar('')
      yukle()
    } catch (e) {
      setMesaj({ tip: 'hata', metin: e instanceof ApiError ? e.message : 'Gold işlemi başarısız.' })
    } finally {
      setIslemId(null)
    }
  }

  const rolRenk = (rol: string) => {
    if (rol === 'admin') return 'bg-red-500/20 text-red-400'
    if (rol === 'performer') return 'bg-[#d4af37]/20 text-[#d4af37]'
    return 'bg-white/10 text-gray-400'
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-1">Kullanıcılar</h1>
      <p className="text-gray-500 text-sm mb-6">Tüm kullanıcıları yönet</p>

      {mesaj && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            mesaj.tip === 'ok' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
          }`}
        >
          {mesaj.metin}
          <button onClick={() => setMesaj(null)} className="ml-3 opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Arama */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="E-posta veya kullanıcı adı..."
            value={aramaGecici}
            onChange={(e) => setAramaGecici(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { setArama(aramaGecici); setSayfa(1) }
            }}
            className="w-full bg-[#12121a] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]/50"
          />
        </div>
        <button
          onClick={() => { setArama(aramaGecici); setSayfa(1) }}
          className="px-4 py-2.5 bg-[#d4af37]/15 text-[#d4af37] rounded-lg text-sm hover:bg-[#d4af37]/25 transition-colors"
        >
          Ara
        </button>
      </div>

      {/* Tablo */}
      <div className="bg-[#12121a] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Kullanıcı</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Rol</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">Gold</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Durum</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Kayıt</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {yukleniyor
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-4 bg-white/5 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              : veri?.kullanicilar.map((k) => (
                  <tr key={k.id} className="border-b border-white/5 hover:bg-white/3">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{k.nickname ?? '—'}</p>
                      <p className="text-gray-500 text-xs">{k.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${rolRenk(k.role)}`}>
                        {k.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-[#d4af37]">{k.gold.toLocaleString('tr-TR')}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs ${
                          k.status === 'banned' ? 'text-red-400' : 'text-green-400'
                        }`}
                      >
                        {k.status === 'banned' ? 'Banlı' : 'Aktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(k.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => { setGoldModal(k); setGoldMiktar('') }}
                          title="Gold düzenle"
                          className="p-1.5 rounded hover:bg-[#d4af37]/15 text-gray-400 hover:text-[#d4af37] transition-colors"
                        >
                          <Coins size={14} />
                        </button>
                        <button
                          onClick={() => banToggle(k)}
                          disabled={islemId === k.id || k.role === 'admin'}
                          title={k.status === 'banned' ? 'Banı kaldır' : 'Banla'}
                          className={`p-1.5 rounded transition-colors ${
                            k.status === 'banned'
                              ? 'hover:bg-green-500/15 text-gray-400 hover:text-green-400'
                              : 'hover:bg-red-500/15 text-gray-400 hover:text-red-400'
                          } disabled:opacity-40`}
                        >
                          {k.status === 'banned' ? <CheckCircle size={14} /> : <Ban size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {/* Sayfalama */}
        {veri && veri.toplamSayfa > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <span className="text-xs text-gray-500">
              {veri.toplam} kullanıcı · {veri.sayfa}/{veri.toplamSayfa} sayfa
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setSayfa((p) => Math.max(1, p - 1))}
                disabled={sayfa === 1}
                className="p-1.5 rounded hover:bg-white/10 text-gray-400 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setSayfa((p) => Math.min(veri.toplamSayfa, p + 1))}
                disabled={sayfa === veri.toplamSayfa}
                className="p-1.5 rounded hover:bg-white/10 text-gray-400 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Gold Modal */}
      {goldModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white font-semibold mb-1">Gold Düzenle</h3>
            <p className="text-gray-400 text-sm mb-5">
              {goldModal.nickname ?? goldModal.email} · Mevcut: {goldModal.gold} gold
            </p>
            <input
              type="number"
              placeholder="Miktar (eksi değer için -)"
              value={goldMiktar}
              onChange={(e) => setGoldMiktar(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3 text-white text-sm mb-4 focus:outline-none focus:border-[#d4af37]/50"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setGoldModal(null)}
                className="flex-1 py-2.5 rounded-lg border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={goldGonder}
                disabled={!goldMiktar || islemId === goldModal.id}
                className="flex-1 py-2.5 rounded-lg bg-[#d4af37] text-black text-sm font-medium hover:bg-[#c9a227] disabled:opacity-50 transition-colors"
              >
                Uygula
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
