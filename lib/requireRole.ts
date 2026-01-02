// lib/requireRole.ts
import { redirect } from 'next/navigation'
import { supabaseSSR } from '@/lib/supabaseSSR'

export type UserRole = 'worker' | 'manager' | 'admin'
type ProfileRow = { role: UserRole }

export async function requireRole(roles: UserRole[], nextPath: string) {
  const supabase = await supabaseSSR()

  const { data: userRes } = await supabase.auth.getUser()
  const user = userRes.user

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<ProfileRow>()

  if (!profile) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`)
  }

  if (!roles.includes(profile.role)) {
    redirect('/')
  }

  return profile.role
}
