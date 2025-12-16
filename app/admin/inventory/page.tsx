import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminInventoryPage() {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get('admin')?.value === '1'

  if (!isAdmin) redirect('/admin')

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold">Admin Inventory Editor</h1>
      <p>You are logged in.</p>
    </main>
  )
}
