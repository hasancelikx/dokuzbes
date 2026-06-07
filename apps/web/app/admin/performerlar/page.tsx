'use client'

import { useEffect, useState, useCallback } from 'react'
import { api, ApiError } from '@/lib/apiClient'
import { Trash2, ChevronLeft, ChevronRight, Activity } from 'lucide-react'

interface Performer {
  id: string
  stageName: string
  category: string
  durum: string
  puan: number
  aktifIzleyici: number
  createdAt: string
  user: { email: string; nickname: string | null; status: string | null }
}

const DURUMLAR = ['online', 'offline', 'musait', 'molada']

export default function PerformerlarSayfasi() {
  const [veri, setVeri] = useState<{ performerlar: Performer[]; toplam: number } | null>(null)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [sayfa, setSayfa] = useState(1)
  const [islemId, setIslemId] = useState<string | null>(null)
  const [silOnay, setSilOnay] = useState<Performer | null>(null)
  const [mesaj, setMesaj] = useState<{ tip: 'ok' | 'hata'; metin: string } | null>(null)

  const toplamSayfa = veri ? Math.ceil(veri.toplam / 20) : 1

  const yukle = useCallback(async () => {
    setYukleniyor(true)
    try {
      const data = await api.admin.get<{ performerlar: Performer[]; toplam: number }>(
        `/admin/performerlar?sayfa=${sayfa}`
      )
      setVeri(data)
    } catch {
      setMesaj({ tip: 'hata', metin: 'Performerlar yüklenemedi.' })
    } finally {
      setYukleniyor(false)
    }
  }, [sayfa])

  useEffect(() => { yukle() }, [yukle])

  async function durumDegistir(p: Performer, durum: string) {
    setIslemId(p.id)
    try {
      await api.admin.patch(`/admin/performerlar/${p.id}/durum`, { durum })
      setMesaj({ tip: 'ok', metin: `${p.stageName} durumu "${durum}" olarak güncellendi.` })
      yukle()
    } catch (e) {
      setMesaj({ tip: 'hata', metin: e instanceof ApiError ? e.message : 'Durum güncellenemedi.' })
    } finally {
      setIslemId(null)
    }
  }

  async function performerSil() {
    if (!silOnay) return
    setIslemId(silOnay.id)
    try {
      await api.admin.delete(`/admin/performerlar/${silOnay.id}`)
      setMesaj({ tip: 'ok', metin: `${silOnay.stageName} performer hesabı silindi.` })
      setSilOnay(null)
      yukle()
    } catch (e) {
      setMesaj({ tip: 'hata', metin: e instanceof ApiError ? e.message : 'Silme işlemi başarısız.' })
    } finally {
      setIslemId(null)
    }
  }

  const durumRenk = (d: string) => {
    if (d === 'online' || d === 'musait') return 'text-green-400'
    if (d === 'molada') return 'text-yellow-400'
    return 'text-gray-500'
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-1">Performerlar</h1>
      <p className="text-gray-500 text-sm mb-6">
        {veri ? `${veri.toplam} performer kayıtlı` : 'Tüm performer hesaplarını yönet'}
      </p>

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

      <div className="bg-[#12121a] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Performer</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Kategori</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Durum</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">Puan</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">İzleyici</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Kayıt</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {yukleniyor
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={7} className="px-4 py-3">
                      <div className="h-4 bg-white/5 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              : veri?.performerlar.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/3">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{p.stageName}</p>
                      <p className="text-gray-500 text-xs">{p.user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs bg-purple-500/15 text-purple-400">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={p.durum}
                        onChange={(e) => durumDegistir(p, e.target.value)}
                        disabled={islemId === p.id}
                        className={`bg-transparent text-sm font-medium focus:outline-none cursor-pointer disabled:opacity-50 ${durumRenk(p.durum)}`}
                      >
                        {DURUMLAR.map((d) => (
                          <option key={d} value={d} className="bg-[#12121a] text-white">
                            {d}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right text-[#d4af37]">{p.puan.toLocaleString('tr-TR')}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="flex items-center justify-end gap-1 text-white">
                        <Activity size={12} className="text-green-400" />
                        {p.aktifIzleyici}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(p.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSilOnay(p)}
                        title="Performer hesabını sil"
                        className="p-1.5 rounded hover:bg-red-500/15 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {toplamSayfa > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <span className="text-xs text-gray-500">
              {veri?.toplam} performer · {sayfa}/{toplamSayfa} sayfa
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
                onClick={() => setSayfa((p) => Math.min(toplamSayfa, p + 1))}
                disabled={sayfa === toplamSayfa}
                className="p-1.5 rounded hover:bg-white/10 text-gray-400 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Silme Onay Modal */}
      {silOnay && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white font-semibold mb-2">Performer Hesabını Sil</h3>
            <p className="text-gray-400 text-sm mb-5">
              <strong className="text-white">{silOnay.stageName}</strong> adlı performer hesabı silinecek. Kullanıcı rolü
              "customer" olarak geri döndürülecek. Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setSilOnay(null)}
                className="flex-1 py-2.5 rounded-lg border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={performerSil}
                disabled={islemId === silOnay.id}
                className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {islemId === silOnay.id ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
