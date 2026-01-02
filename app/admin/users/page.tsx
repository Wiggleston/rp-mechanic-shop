import Link from 'next/link'
import { requireRole } from '@/lib/requireRole'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

type Profile = {
  id: string
  email: string | null
  role: string
  display_name: string | null
}

export default async function AdminUsersPage() {
  await requireRole(['admin'])

  // service role client is fine for admin listing
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id,email,role,display_name')
    .order('role')
    .order('email')
    .returns<Profile[]>()

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Admin — Users</h1>
        <div className="flex gap-4">
          <Link className="underline" href="/admin/inventory">Admin Inventory</Link>
          <Link className="underline" href="/admin/recipes">Recipes</Link>
          <Link className="underline" href="/">Inventory View</Link>
        </div>
      </div>

      {error ? <p>❌ {error.message}</p> : null}

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Name</th>
              <th className="p-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((p) => (
              <tr key={p.id} className="border-t border-white/10">
                <td className="p-3">{p.email ?? '—'}</td>
                <td className="p-3">{p.display_name ?? '—'}</td>
                <td className="p-3">{p.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
