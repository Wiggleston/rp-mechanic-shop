import { NextResponse } from 'next/server'
import { supabaseSSR } from '@/lib/supabaseSSR'

export async function GET(request: Request) {
  const supabase = await supabaseSSR()
  await supabase.auth.signOut()

  const url = new URL('/login', request.url)
  return NextResponse.redirect(url)
}
