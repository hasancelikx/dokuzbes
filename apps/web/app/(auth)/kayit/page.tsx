import type { Metadata } from 'next'
import { RegisterForm } from '@/components/features/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Kayıt Ol — Dokuz Beş',
}

export default function KayitPage() {
  return <RegisterForm />
}
