'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()

  // If already logged in, don’t show login page again
  useEffect(() => {
    async function check() {
      const next = new URLSearchParams(window.location.search).get('next') ?? '/'
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.replace(next)
        router.refresh()
      }
    }
    check()
  }, [router])

  async function signInWithDiscord() {
    const origin = window.location.origin
    const next = new URLSearchParams(window.location.search).get('next') ?? '/'

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })

    if (error) console.error(error.message)
  }

  return (
    <main className="min-h-[70vh] p-6 flex items-center justify-center">
      <div className="w-full max-w-sm space-y-4 rounded-xl border border-white/10 bg-black/30 p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Login</h1>
          <Link className="text-sm underline opacity-80 hover:opacity-100" href="/crafting">
            Crafting
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
