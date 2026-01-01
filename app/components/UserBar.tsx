import Link from 'next/link'
import { supabaseSSR } from '@/lib/supabaseSSR'

export default async function UserBar() {
  const supabase = await supabaseSSR()
  const { data } = await supabase.auth.getUser()
  const user = data.user

  if (!user) {
    return (
      <div className="flex items-center justify-between border-b border-white/10 bg-black/40 p-3">
        <span className="text-sm opacity-70">Not logged in</span>
        <Link className="underline text-sm" href="/login">Login</Link>
      </div>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name, email')
    .eq('id', user.id)
    .single()

  const name = profile?.display_name || profile?.email || user.email || 'User'
  const role = profile?.role ?? 'worker'

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black/40 p-3">
      <div className="text-sm">
        Logged in as <span className="font-semibold">{name}</span>
        <span className="ml-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs">
          {role}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <Link className="underline" href="/">Inventory</Link>
        <Link className="underline" href="/crafting">Crafting</Link>
        <Link className="underline" href="/admin/inventory">Admin</Link>
        <Link className="underline" href="/logout">Logout</Link>
      </div>
    </div>
  )
}
