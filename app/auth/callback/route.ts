// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/'

  // If Discord/Supabase didn't send a code, bounce back to login
  if (!code) {
    return NextResponse.redirect(new URL('/login?err=no_code', url.origin))
  }

  // Build the redirect response FIRST so cookies can be attached to it
  const response = NextResponse.redirect(new URL(next, url.origin))

  // Next.js cookie store
  const cookieStore = await cookies()

  // Supabase SSR client wired to Next cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          // IMPORTANT: set cookies on the response we are returning
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Exchange the auth code for a session (sets sb-* cookies via setAll)
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?err=${encodeURIComponent(error.message)}`, url.origin)
    )
  }

  return response
}
