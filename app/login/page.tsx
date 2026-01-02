'use client'

import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  async function signInWithDiscord() {
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        // DO NOT set redirectTo
        // Supabase will handle the callback correctly
      },
    })
  }

  return (
    <main className="min-h-[70vh] p-6 flex items-center justify-center">
      <div className="w-full max-w-sm space-y-4 rounded-xl border border-white/10 bg-black/30 p-5">
        <h1 className="text-xl font-bold">Login</h1>

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
