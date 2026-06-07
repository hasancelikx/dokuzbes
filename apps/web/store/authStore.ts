import { create } from 'zustand'
import type { DBUser } from '@/types/user'

interface AuthStore {
  kullanici: DBUser | null
  yukleniyor: boolean
  setKullanici: (user: DBUser | null) => void
  setYukleniyor: (val: boolean) => void
  sifirla: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  kullanici: null,
  yukleniyor: true,
  setKullanici: (user) => set({ kullanici: user }),
  setYukleniyor: (val) => set({ yukleniyor: val }),
  sifirla: () => set({ kullanici: null, yukleniyor: false }),
}))
