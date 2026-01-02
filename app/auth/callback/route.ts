import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export const runtime = 'nodejs' // ✅ avoid edge/cookie weirdness

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/'

  if (!code) {
    return NextResponse.redirect(new URL('/login?err=no_code', url.origin))
  }

  try {
    const supabase = await supabaseServer()

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('exchangeCodeForSession error:', error)
      return NextResponse.redirect(
        new URL(`/login?err=${encodeURIComponent(error.message)}`, url.origin)
      )
    }

    return NextResponse.redirect(new URL(next, url.origin))
  } catch (e: any) {
    console.error('auth callback 500:', e)
    return NextResponse.redirect(
      new URL(`/login?err=${encodeURIComponent(e?.message ?? 'callback_failed')}`, url.origin)
    )
  }
}
