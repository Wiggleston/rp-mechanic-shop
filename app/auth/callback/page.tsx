'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    async function finish() {
      // Ensures Supabase reads tokens (hash or code handled client-side)
      await supabase.auth.getSession()

      router.replace('/')
      router.refresh()
    }

    finish()
  }, [router])

  return (
    <main className="min-h-[60vh] p-6 flex items-center justify-center">
      <p className="opacity-80">Finishing sign-in…</p>
    </main>
  )
}
