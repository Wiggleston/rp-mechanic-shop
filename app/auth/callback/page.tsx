'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // If tokens are in the hash, Supabase client can read them and store session
    supabase.auth.getSession().then(() => {
      router.replace('/')
      router.refresh()
    })
  }, [router])

  return (
    <main className="p-6">
      <p>Finishing sign-in…</p>
    </main>
  )
}
