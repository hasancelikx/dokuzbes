'use client'

import { useEffect, useState, useCallback } from 'react'
import { api, ApiError } from '@/lib/apiClient'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

interface Basvuru {
  id: string
  userId: string
  stageName: string
  bio: string | null
  city: string | null
  category: string
  durum: string
  createdAt: string
  user: { email: string; nickname: string | null; createdAt: string }
}

type DurumFiltre = 'beklemede' | 'onaylandi' | 'reddedildi' | 'hepsi'

export default function BasvurularSayfasi() {
  const [basvurular, setBasvurular] = useState<Basvuru[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [filtre, setFiltre] = useState<DurumFiltre>('beklemede')
  const [islemId, setIslemId] = useState<string | null>(null)
  const [redModal, setRedModal] = useState<Basvuru | null>(null)
  const [redNeden, setRedNeden] = useState('')
  const [mesaj, setMesaj] = useState<{ tip: 'ok' | 'hata'; metin: string } | null>(null)

  const yukle = useCallback(async () => {
    setYukleniyor(true)
    try {
      const data = await api.admin.get<{ basvurular: Basvuru[] }>(`/admin/basvurular?durum=${filtre}`)
      setBasvurular(data.basvurular)
    } catch {
      setMesaj({ tip: 'hata', metin: 'Başvurular yüklenemedi.' })
    } finally {
      setYukleniyor(false)
    }
  }, [filtre])

  useEffect(() => { yukle() }, [yukle])

  async function onayla(id: string) {
    setIslemId(id)
    try {
      await api.admin.patch(`/admin/basvurular/${id}/onayla`)
      setMesaj({ tip: 'ok', metin: 'Başvuru onaylandı, performer hesabı oluşturuldu.' })
      yukle()
    } catch (e) {
      setMesaj({ tip: 'hata', metin: e instanceof ApiError ? e.message : 'Onaylama başarısız.' })
    } finally {
      setIslemId(null)
    }
  }

  async function reddet() {
    if (!redModal || redNeden.length < 5) return
    setIslemId(redModal.id)
    try {
      await api.admin.patch(`/admin/basvurular/${redModal.id}/reddet`, { neden: redNeden })
      setMesaj({ tip: 'ok', metin: 'Başvuru reddedildi.' })
      setRedModal(null)
      setRedNeden('')
      yukle()
    } catch (e) {
      setMesaj({ tip: 'hata', metin: e instanceof ApiError ? e.message : 'Red işlemi başarısız.' })
    } finally {
      setIslemId(null)
    }
  }

  const durumRenk = (d: string) => {
    if (d === 'onaylandi') return 'bg-green-500/15 text-green-400'
    if (d === 'reddedildi') return 'bg-red-500/15 text-red-400'
    return 'bg-orange-500/15 text-orange-400'
  }

  const filtreler: { value: DurumFiltre; label: string }[] = [
    { value: 'beklemede', label: 'Bekleyenler' },
    { value: 'onaylandi', label: 'Onaylananlar' },
    { value: 'reddedildi', label: 'Reddedilenler' },
    { value: 'hepsi', label: 'Hepsi' },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-1">Performer Başvuruları</h1>
      <p className="text-gray-500 text-sm mb-6">Başvuruları incele ve onayla</p>

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

      {/* Filtreler */}
      <div className="flex gap-2 mb-6">
        {filtreler.map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltre(f.value)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filtre === f.value
                ? 'bg-[#d4af37]/15 text-[#d4af37]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {yukleniyor ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#12121a] border border-white/10 rounded-xl h-28 animate-pulse" />
          ))}
        </div>
      ) : basvurular.length === 0 ? (
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-12 text-center">
          <Clock size={32} className="mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400">Bu kategoride başvuru yok.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {basvurular.map((b) => (
            <div key={b.id} className="bg-[#12121a] border border-white/10 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-white font-semibold">{b.stageName}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${durumRenk(b.durum)}`}>
                      {b.durum}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs bg-purple-500/15 text-purple-400">
                      {b.category}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-1">{b.user.email}</p>
                  {b.bio && <p className="text-gray-500 text-sm line-clamp-2">{b.bio}</p>}
                  {b.city && <p className="text-gray-500 text-xs mt-1">{b.city}</p>}
                  <p className="text-gray-600 text-xs mt-2">
                    {new Date(b.createdAt).toLocaleString('tr-TR')}
                  </p>
                </div>

                {b.durum === 'beklemede' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => { setRedModal(b); setRedNeden('') }}
                      disabled={islemId === b.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/15 text-red-400 text-sm hover:bg-red-500/25 disabled:opacity-50 transition-colors"
                    >
                      <XCircle size={15} />
                      Reddet
                    </button>
                    <button
                      onClick={() => onayla(b.id)}
                      disabled={islemId === b.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/15 text-green-400 text-sm hover:bg-green-500/25 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle size={15} />
                      {islemId === b.id ? 'İşleniyor...' : 'Onayla'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Red Modal */}
      {redModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white font-semibold mb-1">Başvuruyu Reddet</h3>
            <p className="text-gray-400 text-sm mb-4">{redModal.stageName} — {redModal.user.email}</p>
            <textarea
              rows={3}
              placeholder="Red sebebi (en az 5 karakter)..."
              value={redNeden}
              onChange={(e) => setRedNeden(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3 text-white text-sm mb-4 focus:outline-none focus:border-red-500/50 resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setRedModal(null)}
                className="flex-1 py-2.5 rounded-lg border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={reddet}
                disabled={redNeden.length < 5 || islemId === redModal.id}
                className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                Reddet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
