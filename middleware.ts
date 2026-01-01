import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data } = await supabase.auth.getUser()
  const user = data.user

  const path = req.nextUrl.pathname

  // Public routes anyone can access
  const isPublic =
    path.startsWith('/login') ||
    path.startsWith('/signup') ||
    path.startsWith('/auth/callback') ||
    path.startsWith('/_next') ||
    path.startsWith('/favicon')

  // If not logged in and trying to access anything private -> /login
  if (!user && !isPublic) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If logged in and they hit /login or /signup -> send to home
  if (user && (path === '/login' || path === '/signup')) {
    const url = req.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  matcher: ['/((?!.*\\.(?:png|jpg|jpeg|gif|svg|ico|css|js|map)$).*)'],
}
