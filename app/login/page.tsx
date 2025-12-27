'use client'

import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  async function signInWithDiscord() {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'

    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${origin}/auth/callback`,
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

        <p className="text-xs opacity-60">
          If you get “redirect URL not allowed”, add your callback URL in Supabase Auth settings.
        </p>
      </div>
    </main>
  )
}
