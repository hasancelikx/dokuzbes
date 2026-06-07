'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function YayinciPaneliRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/hesabim') }, [router])
  return null
}
