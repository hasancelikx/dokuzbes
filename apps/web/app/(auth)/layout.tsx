import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Arka plan */}
      <Image
        src="/images/brand/welcome-bg.jpeg"
        alt=""
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      {/* Karanlık overlay */}
      <div className="absolute inset-0 bg-[#0A0A0A]/75 backdrop-blur-sm" />

      {/* İçerik */}
      <div className="relative z-10 w-full max-w-sm px-4">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <h1 className="db-baslik-1 gold-shimmer tracking-[0.15em]">DOKUZ BEŞ</h1>
        </div>

        {children}
      </div>
    </div>
  )
}
