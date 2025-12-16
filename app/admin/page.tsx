import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Server Action — THIS is where cookies are allowed
 */
export async function adminLogin(formData: FormData) {
  'use server'

  const pin = String(formData.get('pin') ?? '')
  const correct = process.env.ADMIN_PIN ?? ''

  if (pin && correct && pin === correct) {
    const cookieStore = await cookies()
    cookieStore.set('admin', '1', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })
    redirect('/admin/inventory')
  }

  redirect('/admin?err=1')
}

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { err?: string }
}) {
  return (
    <main className="p-6 max-w-sm">
      <h1 className="text-xl font-bold mb-4">Admin</h1>

      {searchParams?.err ? <p className="mb-3">❌ Wrong PIN</p> : null}

      <form action={adminLogin} className="space-y-3">
        <input
          name="pin"
          type="password"
          placeholder="Admin PIN"
          className="w-full rounded bg-black border border-white/20 p-2"
        />
        <button className="w-full rounded bg-white text-black font-semibold p-2">
          Enter
        </button>
      </form>
    </main>
  )
}
