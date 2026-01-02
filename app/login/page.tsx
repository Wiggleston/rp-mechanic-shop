'use client'

import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

export default function LoginPage() {
  async function signInWithDiscord() {
    const supabase = supabaseBrowser()

    const origin = window.location.origin
    const next =
      new URLSearchParams(window.location.search).get('next') ?? '/'

    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
  }

  return (
    <main className="min-h-[70vh] p-6 flex items-center justify-center">
      <div className="w-full max-w-sm space-y-4 rounded-xl border border-white/10 bg-black/30 p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Login</h1>
          <Link className="text-sm underline opacity-80 hover:opacity-100" href="/">
            Back
          </Link>
        </div>

        <p className="text-sm opacity-70">Sign in with Discord to continue.</p>

        <button
          onClick={signInWithDiscord}
          className="w-full rounded bg-white text-black font-semibold p-2"
        >
          Continue with Discord
        </button>
      </div>
    </main>
  )
}
