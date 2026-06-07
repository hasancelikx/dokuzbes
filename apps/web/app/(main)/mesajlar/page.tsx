'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { DBAvatar } from '@/components/ui/DBAvatar'
import { useAuth } from '@/hooks/useAuth'
import { useSalon } from '@/hooks/useSalon'

interface Konusma {
  id: number
  isim: string
  son: string
  zaman: string
  okunmamis: number
}

interface Mesaj {
  id: number
  ben: boolean
  metin: string
  zaman: string
}

const KONUSMALAR: Konusma[] = [
  { id: 1, isim: 'Ece Demir',  son: 'Merhaba! Yayınıma hoş geldin 👋',        zaman: '22:30', okunmamis: 2 },
  { id: 2, isim: 'Sara Aydın', son: 'Teşekkürler hediye için!',                 zaman: '5 dk',  okunmamis: 0 },
  { id: 3, isim: 'Luna',       son: 'Yarın aynı saatte görüşürüz',              zaman: '1 sa',  okunmamis: 1 },
  { id: 4, isim: 'Zeynep',     son: 'Harika geliyorsun, şaşın süper!',          zaman: '12:00', okunmamis: 0 },
]

const MESAJLAR: Mesaj[] = [
  { id: 1, ben: false, metin: 'Merhaba! Yayınıma hoş geldin 👋',     zaman: '22:28' },
  { id: 2, ben: true,  metin: 'Merhaba Ece! Çok güzel yayın',         zaman: '22:29' },
  { id: 3, ben: false, metin: 'Teşekkürler 😊 Nasılsın?',             zaman: '22:30' },
  { id: 4, ben: true,  metin: 'İyiyim, sen de güzel görünüyorsun',    zaman: '22:31' },
]

export default function MesajlarPage() {
  useAuth()
  const { yayincilar } = useSalon('tumu')
  const gorselMap = Object.fromEntries(yayincilar.map(y => [y.displayName, y.avatarUrl]))
  const [seciliId, setSeciliId] = useState<number>(1)
  const [mesajler, setMesajler] = useState<Mesaj[]>(MESAJLAR)
  const [yeniMesaj, setYeniMesaj] = useState('')

  const seciliKonusma = KONUSMALAR.find((k) => k.id === seciliId) ?? KONUSMALAR[0]

  function gonder() {
    const trimmed = yeniMesaj.trim()
    if (!trimmed) return
    setMesajler((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        ben: true,
        metin: trimmed,
        zaman: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    setYeniMesaj('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') gonder()
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">

      {/* ── SOL PANEL ── */}
      <div className="hidden md:flex flex-col shrink-0 border-r border-[rgba(201,168,76,0.08)] bg-[#0A0A0A]" style={{ width: 260 }}>

        {/* Başlık */}
        <div className="px-4 pt-6 pb-4 border-b border-[rgba(201,168,76,0.06)]">
          <h2 className="db-baslik-3 text-[#F0EDE8] mb-3">Konuşmalar</h2>
          <input
            type="text"
            placeholder="Ara..."
            className="w-full h-9 bg-[#111111] rounded-[10px] px-3 text-[13px] text-[#F0EDE8] border border-[rgba(201,168,76,0.15)] focus:border-[rgba(201,168,76,0.4)] outline-none placeholder:text-[#5A5050] transition-all"
          />
        </div>

        {/* Konuşma Listesi */}
        <div className="flex flex-col overflow-y-auto flex-1">
          {KONUSMALAR.map((k) => (
            <button
              key={k.id}
              onClick={() => setSeciliId(k.id)}
              className={[
                'flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer border-b border-[rgba(255,255,255,0.03)]',
                k.id === seciliId
                  ? 'bg-[rgba(201,168,76,0.08)]'
                  : 'hover:bg-[#111111]',
              ].join(' ')}
            >
              <DBAvatar src={gorselMap[k.isim] || null} initials={k.isim} size={40} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="db-govde-kck text-[#F0EDE8] font-semibold truncate">{k.isim}</p>
                  <span className="text-[10px] text-[#5A5050] shrink-0 ml-1">{k.zaman}</span>
                </div>
                <p className="db-kucuk text-[#5A5050] truncate">{k.son}</p>
              </div>
              {k.okunmamis > 0 && (
                <span className="shrink-0 min-w-[18px] h-[18px] bg-[#8B1A2A] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {k.okunmamis}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── SAĞ PANEL ── */}
      <div className="flex-1 flex flex-col">

        {/* Üst Bar */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-[rgba(201,168,76,0.08)] bg-[#0A0A0A]">
          <DBAvatar src={gorselMap[seciliKonusma.isim] || null} initials={seciliKonusma.isim} size={40} status="online" />
          <div>
            <p className="db-govde text-[#F0EDE8] font-semibold">{seciliKonusma.isim}</p>
            <p className="db-kucuk text-[#4CAF50]">Çevrimiçi</p>
          </div>
        </div>

        {/* Mesaj Alanı */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
          style={{ minHeight: 0 }}
        >
          {mesajler.map((m) => (
            <div
              key={m.id}
              className={['flex', m.ben ? 'justify-end' : 'justify-start'].join(' ')}
            >
              <div
                className={[
                  'max-w-[72%] rounded-[14px] px-4 py-2.5 flex flex-col gap-0.5',
                  m.ben
                    ? 'bg-[#8B1A2A] rounded-br-[4px]'
                    : 'bg-[#1A1A1A] rounded-bl-[4px]',
                ].join(' ')}
              >
                <p className="db-govde-kck text-[#F0EDE8] leading-snug">{m.metin}</p>
                <p className={['text-[10px]', m.ben ? 'text-[rgba(240,237,232,0.5)]' : 'text-[#5A5050]'].join(' ')}>
                  {m.zaman}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mesaj Yazma Alanı */}
        <div className="px-4 py-3 border-t border-[rgba(201,168,76,0.08)] flex items-center gap-3 bg-[#0A0A0A]">
          <input
            type="text"
            value={yeniMesaj}
            onChange={(e) => setYeniMesaj(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mesaj yaz..."
            className="flex-1 h-10 bg-[#111111] rounded-full px-4 text-[14px] text-[#F0EDE8] border border-[rgba(201,168,76,0.15)] focus:border-[rgba(201,168,76,0.4)] outline-none placeholder:text-[#5A5050] transition-all"
          />
          <button
            onClick={gonder}
            disabled={!yeniMesaj.trim()}
            className="w-10 h-10 rounded-full bg-[#C9A84C] flex items-center justify-center hover:bg-[#E0C070] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            <Send size={16} className="text-[#0A0A0A]" />
          </button>
        </div>
      </div>

    </div>
  )
}
