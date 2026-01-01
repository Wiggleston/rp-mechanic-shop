// lib/requireRole.ts
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabaseServer'

export type UserRole = 'worker' | 'manager' | 'admin'

type ProfileRow = {
  role: UserRole
}

export async function requireRole(roles: UserRole[]) {
  const supabase = supabaseServer

  // 1️⃣ Ensure user is logged in
  const { data: userRes, error: userErr } = await supabase.auth.getUser()

  if (userErr || !userRes?.user) {
    redirect('/login')
  }

  const user = userRes.user

  // 2️⃣ Fetch role from profiles table
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<ProfileRow>()

  if (profileErr || !profile) {
    redirect('/login')
  }

  // 3️⃣ Enforce role
  if (!roles.includes(profile.role)) {
    redirect('/')
  }

  return profile.role
}
