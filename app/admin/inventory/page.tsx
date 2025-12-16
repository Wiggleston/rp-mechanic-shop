import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function login(formData: FormData) {
  'use server'
  const pin = String(formData.get('pin') ?? '')
  if (pin === (process.env.ADMIN_PIN ?? '')) {
    const cookieStore = await cookies()
    cookieStore.set('admin', '1', { httpOnly: true, sameSite: 'lax', path: '/' })
    redirect('/admin/inventory')
  }
  redirect('/admin?err=1')
}

export default function AdminPage() {
  return (
    <main className="p-6 max-w-sm">
      <h1 className="text-xl font-bold mb-4">Admin</h1>
      <form action={login} className="space-y-3">
        <input name="pin" type="password" className="w-full rounded bg-black border border-white/20 p-2" />
        <button className="w-full rounded bg-white text-black font-semibold p-2">Enter</button>
      </form>
    </main>
  )
}
