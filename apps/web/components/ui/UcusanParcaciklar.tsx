'use client'

import { useMemo } from 'react'

/**
 * Ambient hareket — havada süzülen altın yaprak + toz parçacıkları.
 * Saf CSS (GPU transform), tıklamayı geçirir, `prefers-reduced-motion`'a saygılı
 * (global media query süreyi sıfırlar → hareket durur). Ebeveyn `position:relative`
 * + `overflow-hidden` olmalı.
 */
interface Props {
  adet?: number
  className?: string
}

export function UcusanParcaciklar({ adet = 14, className = '' }: Props) {
  const parcaciklar = useMemo(
    () =>
      Array.from({ length: adet }, (_, i) => {
        const yaprak = i % 3 === 0 // her 3'te 1 yaprak, gerisi toz
        const boyut = yaprak ? 9 + Math.random() * 6 : 3 + Math.random() * 3
        return {
          id: i,
          sol: Math.random() * 100,
          boyut,
          sure: 8 + Math.random() * 7,
          gecikme: Math.random() * 10,
          sway: Math.random() * 70 - 35,
          op: yaprak ? 0.55 + Math.random() * 0.3 : 0.35 + Math.random() * 0.3,
          yaprak,
        }
      }),
    [adet],
  )

  return (
    <div
      className={['absolute inset-0 overflow-hidden pointer-events-none', className].join(' ')}
      aria-hidden
    >
      {parcaciklar.map((p) => (
        <span
          key={p.id}
          className="absolute"
          style={
            {
              left: `${p.sol}%`,
              bottom: -24,
              width: p.boyut,
              height: p.boyut,
              borderRadius: p.yaprak ? '60% 0 60% 0' : '50%',
              background: p.yaprak
                ? 'radial-gradient(circle at 30% 30%, #E8C96A, #C9A84C 65%, transparent)'
                : 'radial-gradient(circle, rgba(201,168,76,0.95), transparent 70%)',
              boxShadow: p.yaprak
                ? '0 0 9px rgba(201,168,76,0.55)'
                : '0 0 6px rgba(201,168,76,0.45)',
              opacity: 0,
              animation: `parcacikYuksel ${p.sure}s linear ${p.gecikme}s infinite`,
              '--p-sway': `${p.sway}px`,
              '--p-op': p.op,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
