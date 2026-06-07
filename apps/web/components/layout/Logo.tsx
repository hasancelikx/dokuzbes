import Link from 'next/link'

interface LogoProps {
  variant?: 'sidebar' | 'compact'
  className?: string
}

export function Logo({ variant = 'sidebar', className = '' }: LogoProps) {
  const boyut = variant === 'sidebar' ? 56 : 36
  const rakamBoyut = variant === 'sidebar' ? 28 : 18

  return (
    <Link
      href="/salon"
      className={['flex items-center gap-3 select-none', className].join(' ')}
    >
      {/* Yuvarlak daire + "9" */}
      <div
        className="relative shrink-0 flex items-center justify-center rounded-full bg-[#111111] border border-[rgba(201,168,76,0.4)]"
        style={{ width: boyut, height: boyut }}
      >
        <span
          className="font-bold text-[#C9A84C] leading-none"
          style={{
            fontSize: rakamBoyut,
            fontFamily: '"Cormorant Garamond", serif',
          }}
        >
          9
        </span>
      </div>

      {/* DOKUZ BEŞ metin */}
      {variant === 'sidebar' && (
        <div className="flex flex-col leading-none">
          <span
            className="text-[#5A5050] tracking-[0.2em] uppercase"
            style={{ fontSize: 10, fontFamily: 'Inter, sans-serif' }}
          >
            DOKUZ
          </span>
          <span
            className="text-[#C9A84C] tracking-[0.12em] uppercase gold-shimmer"
            style={{
              fontSize: 18,
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 700,
            }}
          >
            BEŞ
          </span>
        </div>
      )}
    </Link>
  )
}
