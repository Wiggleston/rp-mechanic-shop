import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/'

  if (!code) {
    return NextResponse.redirect(new URL('/login?err=no_code', url.origin))
  }

  const supabase = await supabaseServer()

const { error } = await supabase.auth.exchangeCodeForSession(code)

if (error) {
  console.error('EXCHANGE ERROR:', error)
  return NextResponse.redirect(
    new URL(`/login?err=${encodeURIComponent(error.message)}`, url.origin)
  )
}

}
