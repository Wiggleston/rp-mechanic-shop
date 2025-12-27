'use client'

import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  async function startDiscord() {
    const origin = window.location.origin
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: `${origin}/auth/callback` },
    })
  }

  return (
    <main className="min-h-[70vh] p-6 flex items-center justify-center">
      <div className="w-full max-w-sm space-y-4 rounded-xl border border-white/10 bg-black/30 p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Create Account</h1>
          <Link className="text-sm underline opacity-80 hover:opacity-100" href="/login">
            Login
          </Link>
        </div>

        <p className="text-sm opacity-70">Create your account using Discord.</p>

        <button
          onClick={startDiscord}
          className="w-full rounded bg-white text-black font-semibold p-2"
        >
          Sign up with Discord
        </button>
      </div>
    </main>
  )
}
