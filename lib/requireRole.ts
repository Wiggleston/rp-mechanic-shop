import { redirect } from 'next/navigation'
import { supabaseSSR } from '@/lib/supabaseSSR'

export async function requireRole(roles: ('worker'|'manager'|'admin')[]) {
  const supabase = await supabaseSSR()
  const { data: userRes } = await supabase.auth.getUser()
  const user = userRes.user
  if (!user) redirect('/login')

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !profile?.role) redirect('/login')
  if (!roles.includes(profile.role)) redirect('/')

  return profile.role
}
