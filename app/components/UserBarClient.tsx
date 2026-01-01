'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Role = 'worker' | 'manager' | 'admin'

export default function UserBarClient() {
  const [email, setEmail] = useState<string | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)

      const { data } = await supabase.auth.getUser()
      const user = data.user

      if (!mounted) return

      if (!user) {
        setEmail(null)
        setRole(null)
        setLoading(false)
        return
      }

      setEmail(user.email ?? 'User')

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      setRole((profile?.role as Role) ?? 'worker')
      setLoading(false)
    }

    load()

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      load()
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black/40 p-3">
      <div className="text-sm">
        {loading ? (
          <span className="opacity-70">Checking login…</span>
        ) : email ? (
          <>
            Logged in as <span className="font-semibold">{email}</span>
            {role ? (
              <span className="ml-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs">
                {role}
              </span>
            ) : null}
          </>
        ) : (
          <span className="opacity-70">Not logged in</span>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm">
        <Link className="underline" href="/">Inventory</Link>
        <Link className="underline" href="/crafting">Crafting</Link>
        <Link className="underline" href="/admin/inventory">Admin</Link>
        {email ? (
          <button className="underline" onClick={logout}>Logout</button>
        ) : (
          <Link className="underline" href="/login">Login</Link>
        )}
      </div>
    </div>
  )
}
