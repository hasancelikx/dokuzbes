'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Arka plan */}
      <Image
        src="/images/brand/welcome-bg.jpeg"
        alt=""
        fill
        className="object-cover scale-105"
        priority
        sizes="100vw"
      />

      {/* Katmanlı karanlık overlay */}
      <div className="absolute inset-0 bg-[#0A0A0A]/60 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/40 via-transparent to-[#0A0A0A]/80" />

      {/* Dekoratif gold parıltılar */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[rgba(201,168,76,0.04)] blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full bg-[rgba(139,26,42,0.06)] blur-3xl pointer-events-none" />

      {/* İçerik */}
      <div className="relative z-10 w-full max-w-sm px-4 flex flex-col items-center">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-2 mb-10"
        >
          <h1
            className="gold-shimmer tracking-[0.22em] font-bold"
            style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36 }}
          >
            DOKUZ BEŞ
          </h1>
          <div className="flex items-center gap-2">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-[rgba(201,168,76,0.4)]" />
            <span className="text-[#5A5050] text-[10px] tracking-[0.3em] uppercase font-medium">
              Canlı Eğlence
            </span>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-[rgba(201,168,76,0.4)]" />
          </div>
        </motion.div>

        {/* Form kartı */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          {children}
        </motion.div>

      </div>
    </div>
  )
}
