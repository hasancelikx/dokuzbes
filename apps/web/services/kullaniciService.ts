import { api } from '@/lib/apiClient'

export interface ProfilGuncellemeVerisi {
  nickname?: string
  city?: string
}

export async function profilGuncelle(data: ProfilGuncellemeVerisi) {
  return api.user.patch('/users/me', data)
}

export async function profilGetir() {
  return api.user.get('/users/me')
}

export async function nicknameKontrol(nickname: string): Promise<{ musait: boolean }> {
  try {
    await api.user.get(`/users/nickname-check?nickname=${encodeURIComponent(nickname)}`)
    return { musait: true }
  } catch {
    return { musait: false }
  }
}
