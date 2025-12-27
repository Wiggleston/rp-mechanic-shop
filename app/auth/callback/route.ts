import { NextResponse } from 'next/server'
import { supabaseSSR } from '@/lib/supabaseSSR'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  if (code) {
    const supabase = await supabaseSSR()
    // exchanges the code for a session + writes auth cookies
    await supabase.auth.exchangeCodeForSession(code)
  }

  // send them wherever you want after login
  return NextResponse.redirect(new URL('/', url.origin))
}
