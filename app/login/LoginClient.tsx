'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginClient() {
  const search = useSearchParams()
  const next = search.get('next') ?? '/'
  const err = search.get('err')

 async function signInWithDiscord() {
  const origin = window.location.origin
  const next = new URLSearchParams(window.location.search).get('next') ?? '/'

  await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
}


  return (
    <main className="min-h-[70vh] p-6 flex items-center justify-center">
      <div className="w-full max-w-sm space-y-4 rounded-xl border border-white/10 bg-black/30 p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Login</h1>
          <Link className="text-sm underline opacity-80 hover:opacity-100" href={next}>
            Back
          </Link>
        </div>

        {err ? <p className="text-sm">❌ {err}</p> : <p className="text-sm opacity-70">Sign in with Discord to continue.</p>}

        <button onClick={signInWithDiscord} className="w-full rounded bg-white text-black font-semibold p-2">
          Continue with Discord
        </button>
      </div>
    </main>
  )
}
