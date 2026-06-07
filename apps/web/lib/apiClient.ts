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

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new ApiError(data.code ?? 'BILINMEYEN_HATA', res.status, data.message)
  }

  return data as T
}

function makeClient(base: string) {
  return {
    get:    <T>(path: string)               => apiFetch<T>(`${base}${path}`),
    post:   <T>(path: string, body?: unknown) => apiFetch<T>(`${base}${path}`, { method: 'POST',  body: JSON.stringify(body ?? {}) }),
    patch:  <T>(path: string, body?: unknown) => apiFetch<T>(`${base}${path}`, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
    delete: <T>(path: string)               => apiFetch<T>(`${base}${path}`, { method: 'DELETE' }),
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
