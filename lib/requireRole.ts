// lib/requireRole.ts
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabaseServer'

export type UserRole = 'worker' | 'manager' | 'admin'
type ProfileRow = { role: UserRole }

export async function requireRole(allowed: UserRole[]) {
  const supabase = await supabaseServer()

  const { data } = await supabase.auth.getUser()
  const user = data.user
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<ProfileRow>()

  if (!profile || !allowed.includes(profile.role)) redirect('/')

  return profile.role
}
