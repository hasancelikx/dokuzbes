const BASE = {
  auth:      process.env.NEXT_PUBLIC_AUTH_URL      ?? 'http://localhost:3001',
  user:      process.env.NEXT_PUBLIC_USER_URL      ?? 'http://localhost:3002',
  performer: process.env.NEXT_PUBLIC_PERFORMER_URL ?? 'http://localhost:3003',
  mesa:      process.env.NEXT_PUBLIC_MESA_URL      ?? 'http://localhost:3004',
  gold:      process.env.NEXT_PUBLIC_GOLD_URL      ?? 'http://localhost:3007',
  payment:   process.env.NEXT_PUBLIC_PAYMENT_URL   ?? 'http://localhost:3008',
  admin:     process.env.NEXT_PUBLIC_ADMIN_URL     ?? 'http://localhost:3011',
  livekit:   process.env.NEXT_PUBLIC_LIVEKIT_SVC_URL  ?? 'http://localhost:3009',
  notif:     process.env.NEXT_PUBLIC_NOTIF_URL        ?? 'http://localhost:3010',
  cekim:     process.env.NEXT_PUBLIC_CEKIM_URL        ?? 'http://localhost:3012',
} as const

export class ApiError extends Error {
  constructor(public code: string, public status: number, message?: string) {
    super(message ?? code)
    this.name = 'ApiError'
  }
}

// Refresh tetiklememesi gereken yollar (sonsuz döngü / anlamsız yenileme önler)
const REFRESH_HARIC = ['/auth/refresh', '/auth/login', '/auth/register', '/auth/logout']

// Single-flight: aynı anda birçok istek 401 alsa bile tek bir /auth/refresh çağrısı yapılır
let refreshPromise: Promise<boolean> | null = null

function tokenYenile(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE.auth}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(r => r.ok)
      .catch(() => false)
      .finally(() => { refreshPromise = null })
  }
  return refreshPromise
}

function oturumBitti() {
  if (typeof window === 'undefined') return
  // Zaten giriş/kayıt sayfasındaysak yönlendirme yapma (döngü önler)
  const yol = window.location.pathname
  if (yol.startsWith('/giris') || yol.startsWith('/kayit')) return
  window.location.href = '/giris?expired=1'
}

async function apiFetch<T>(url: string, options?: RequestInit, yenidenDene = true): Promise<T> {
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })

  // Access token süresi dolmuş → bir kez yenile, sonra orijinal isteği tekrarla
  if (res.status === 401 && yenidenDene && !REFRESH_HARIC.some(p => url.includes(p))) {
    const yenilendi = await tokenYenile()
    if (yenilendi) return apiFetch<T>(url, options, false)
    oturumBitti()
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new ApiError(data.code ?? 'BILINMEYEN_HATA', res.status, data.message)
  }

  return data as T
}

// Multipart (dosya) yükleme — Content-Type'ı tarayıcı boundary ile kendi ayarlar
async function apiUpload<T>(url: string, form: FormData, yenidenDene = true): Promise<T> {
  const res = await fetch(url, { method: 'POST', credentials: 'include', body: form })

  if (res.status === 401 && yenidenDene && !REFRESH_HARIC.some(p => url.includes(p))) {
    const yenilendi = await tokenYenile()
    if (yenilendi) return apiUpload<T>(url, form, false)
    oturumBitti()
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(data.code ?? 'BILINMEYEN_HATA', res.status, data.message)
  return data as T
}

function makeClient(base: string) {
  return {
    get:    <T>(path: string)               => apiFetch<T>(`${base}${path}`),
    post:   <T>(path: string, body?: unknown) => apiFetch<T>(`${base}${path}`, { method: 'POST',  body: JSON.stringify(body ?? {}) }),
    put:    <T>(path: string, body?: unknown) => apiFetch<T>(`${base}${path}`, { method: 'PUT',   body: JSON.stringify(body ?? {}) }),
    patch:  <T>(path: string, body?: unknown) => apiFetch<T>(`${base}${path}`, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
    delete: <T>(path: string)               => apiFetch<T>(`${base}${path}`, { method: 'DELETE' }),
    upload: <T>(path: string, form: FormData) => apiUpload<T>(`${base}${path}`, form),
  }
}

export const api = {
  auth:      makeClient(BASE.auth),
  user:      makeClient(BASE.user),
  performer: makeClient(BASE.performer),
  mesa:      makeClient(BASE.mesa),
  gold:      makeClient(BASE.gold),
  payment:   makeClient(BASE.payment),
  admin:     makeClient(BASE.admin),
  livekit:   makeClient(BASE.livekit),
  notif:     makeClient(BASE.notif),
  cekim:     makeClient(BASE.cekim),
}
