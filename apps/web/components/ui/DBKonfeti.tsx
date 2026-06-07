'use client'

import { useEffect, useState } from 'react'

interface Parcacik {
  id: string
  x: number
  renk: string
  boyut: number
  gecikme: number
  sure: number
  sekil: 'kare' | 'daire' | 'uzun'
}

const RENKLER = ['#C9A84C', '#F0D070', '#8B1A2A', '#E8B4B8', '#F0EDE8', '#D4891A']

function parcacikUret(sayi: number): Parcacik[] {
  return Array.from({ length: sayi }, (_, i) => ({
    id: `k-${i}`,
    x: Math.random() * 100,
    renk: RENKLER[Math.floor(Math.random() * RENKLER.length)],
    boyut: 6 + Math.random() * 8,
    gecikme: Math.random() * 0.8,
    sure: 2.5 + Math.random() * 1.5,
    sekil: (['kare', 'daire', 'uzun'] as const)[Math.floor(Math.random() * 3)],
  }))
}

interface DBKonfetiProps {
  aktif: boolean
  sure?: number       /* ms cinsinden toplam süre */
  sayi?: number       /* kaç parcacık */
  onBitti?: () => void
}

export function DBKonfeti({ aktif, sure = 3000, sayi = 40, onBitti }: DBKonfetiProps) {
  const [parcaciklar] = useState(() => parcacikUret(sayi))
  const [goruntu, setGoruntu] = useState(aktif)

  useEffect(() => {
    if (!aktif) return
    setGoruntu(true)
    const t = setTimeout(() => {
      setGoruntu(false)
      onBitti?.()
    }, sure)
    return () => clearTimeout(t)
  }, [aktif, sure, onBitti])

  if (!goruntu || !aktif) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[9998] overflow-hidden">
      {parcaciklar.map(p => (
        <div
          key={p.id}
          className="absolute top-0"
          style={{
            left: `${p.x}%`,
            width: p.boyut,
            height: p.sekil === 'uzun' ? p.boyut * 2.5 : p.boyut,
            backgroundColor: p.renk,
            borderRadius: p.sekil === 'daire' ? '50%' : p.sekil === 'kare' ? '2px' : '3px',
            animation: `konfetiDus ${p.sure}s ${p.gecikme}s ease-in forwards`,
            opacity: 0.9,
          }}
        />
      ))}
    </div>
  )
}
