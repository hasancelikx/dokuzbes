'use client'

import { useState, useEffect, useMemo } from 'react'

/**
 * Şampanya patlaması — sağ üst köşeden patlar, altın damlalar tüm sayfaya yağar.
 * Belli aralıklarla otomatik tetiklenir. Saf CSS/GPU (GIF yok), tıklamayı geçirir,
 * `prefers-reduced-motion`'da global media query süreyi sıfırlar → efekt görünmez.
 */
interface Props {
  aralikSn?: number // patlamalar arası saniye
  damla?: number    // her patlamadaki damla sayısı
  ilkGecikmeSn?: number
}

export function SampanyaPatlamasi({ aralikSn = 32, damla = 44, ilkGecikmeSn = 4 }: Props) {
  const [tur, setTur] = useState(0) // her artış = yeni patlama

  useEffect(() => {
    const ilk = setTimeout(() => setTur((t) => t + 1), ilkGecikmeSn * 1000)
    const intv = setInterval(() => setTur((t) => t + 1), aralikSn * 1000)
    return () => {
      clearTimeout(ilk)
      clearInterval(intv)
    }
  }, [aralikSn, ilkGecikmeSn])

  if (tur === 0) return null
  return <Patlama key={tur} damla={damla} />
}

function Patlama({ damla }: { damla: number }) {
  const damlalar = useMemo(
    () =>
      Array.from({ length: damla }, (_, i) => ({
        id: i,
        dx: -(18 + Math.random() * 100), // vw — sola yayıl
        dy: 25 + Math.random() * 80, // vh — aşağı dök
        boyut: 4 + Math.random() * 7,
        sure: 2.2 + Math.random() * 1.9,
        gecikme: Math.random() * 0.55,
        donme: Math.random() * 560 - 280,
        kabarcik: i % 3 === 0,
      })),
    [damla],
  )

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden" aria-hidden>
      {/* Patlama parlaması — sağ üst */}
      <span
        className="absolute rounded-full"
        style={{
          top: 6,
          right: 8,
          width: 64,
          height: 64,
          background: 'radial-gradient(circle, rgba(255,243,210,0.55), transparent 70%)',
          animation: 'sampanyaFlash 0.6s ease-out forwards',
        }}
      />
      {damlalar.map((d) => (
        <span
          key={d.id}
          className="absolute rounded-full"
          style={
            {
              top: 8,
              right: 14,
              width: d.boyut,
              height: d.boyut,
              background: d.kabarcik
                ? 'radial-gradient(circle at 30% 30%, #fff7e0, #E8C96A 70%, transparent)'
                : 'radial-gradient(circle, rgba(201,168,76,0.95), rgba(232,201,106,0.55) 60%, transparent)',
              boxShadow: '0 0 6px rgba(232,201,106,0.6)',
              opacity: 0,
              animation: `sampanyaDokul ${d.sure}s cubic-bezier(0.22,0.7,0.3,1) ${d.gecikme}s forwards`,
              '--dx': `${d.dx}vw`,
              '--dy': `${d.dy}vh`,
              '--rot': `${d.donme}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
