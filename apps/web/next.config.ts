import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  devIndicators: false,

    allowedDevOrigins: ['compliance-drain-moderate-infrastructure.trycloudflare.com'],

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'randomuser.me' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'http',  hostname: 'localhost', port: '9100' },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Tüm mikroservis isteklerini Next.js üzerinden proxy'le
  // Böylece dışarıya sadece port 3000 açılır (tunnel için)
  async rewrites() {
    return [
      { source: '/svc/auth/:path*',      destination: 'http://localhost:3001/:path*' },
      { source: '/svc/users/:path*',     destination: 'http://localhost:3002/:path*' },
      { source: '/svc/performer/:path*', destination: 'http://localhost:3003/:path*' },
      { source: '/svc/mesa/:path*',      destination: 'http://localhost:3004/:path*' },
      { source: '/svc/gold/:path*',      destination: 'http://localhost:3007/:path*' },
      { source: '/svc/payment/:path*',   destination: 'http://localhost:3008/:path*' },
      { source: '/svc/livekit/:path*',   destination: 'http://localhost:3009/:path*' },
      { source: '/svc/notif/:path*',     destination: 'http://localhost:3010/:path*' },
      { source: '/svc/admin/:path*',     destination: 'http://localhost:3011/:path*' },
      { source: '/svc/cekim/:path*',     destination: 'http://localhost:3012/:path*' },
    ]
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options',        value: 'DENY' },
          { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://randomuser.me https://images.unsplash.com http://localhost:9100",
              // Servisler artık /svc/* üzerinden 'self' kapsamında — ayrıca localhost'u da geliştirme için bırakıyoruz
              "connect-src 'self' http://localhost:3001 http://localhost:3002 http://localhost:3003 http://localhost:3004 http://localhost:3007 http://localhost:3008 http://localhost:3009 http://localhost:3010 http://localhost:3011 http://localhost:3012 ws://localhost:7880 wss://localhost:7880",
              "media-src 'self' blob:",
              "frame-src 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
