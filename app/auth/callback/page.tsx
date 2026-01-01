'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const sp = useSearchParams()

  useEffect(() => {
    async function finish() {
      // If Supabase returned a code or hash, this will establish the session client-side
      await supabase.auth.getSession()

      const next = sp.get('next') ?? '/'
      router.replace(next)
      router.refresh()
    }

    finish()
  }, [router, sp])

  return (
    <main className="min-h-[60vh] p-6 flex items-center justify-center">
      <p className="opacity-80">Finishing sign-in…</p>
    </main>
  )
}
