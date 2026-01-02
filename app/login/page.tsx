'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function prettyErr(code: string) {
  if (code === 'no_code') return 'Login failed: no OAuth code returned.'
  if (code === 'exchange_failed') return 'Login failed: could not create session (exchange failed).'
  return `Login failed: ${code}`
}

export default function LoginPage() {
  const search = useSearchParams()
  const next = search.get('next') ?? '/'
  const err = search.get('err')

  async function signInWithDiscord() {
    const origin = window.location.origin

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        // Must match your route handler: app/auth/callback/route.ts
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })

    if (error) {
      console.error(error.message)
      // Optional: you can show a toast here if you want
    }
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

        <p className="text-sm opacity-70">Sign in with Discord to continue.</p>

        {err ? (
          <p className="text-sm rounded-lg border border-red-500/30 bg-red-500/10 p-3">
            ❌ {prettyErr(err)}
          </p>
        ) : null}

        <button
          onClick={signInWithDiscord}
          className="w-full rounded bg-white text-black font-semibold p-2"
        >
          Continue with Discord
        </button>

        <p className="text-xs opacity-60">
          If you get “redirect URL not allowed”, add{' '}
          <span className="font-mono">{`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}</span>{' '}
          to Supabase Auth Redirect URLs.
        </p>
      </div>
    </main>
  )
}
