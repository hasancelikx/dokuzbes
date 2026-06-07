import type { Metadata } from 'next'
import { LoginForm } from '@/components/features/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Giriş Yap — Dokuz Beş',
}

export default function GirisPage() {
  return <LoginForm />
}
