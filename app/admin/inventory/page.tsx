import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabaseServer'
import AddItemForm from './AddItemForm'
import InventoryRowForm from './InventoryRowForm'

type InventoryItem = {
  id: string
  name: string
  category: string
  stock: number
  location: string | null
  notes: string | null
  low_stock_threshold: number
}

export default async function AdminInventoryPage() {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get('admin')?.value === '1'
  if (!isAdmin) redirect('/admin')

  const { data, error } = await supabaseServer
    .from('inventory_items')
    .select('id,name,category,stock,location,notes,low_stock_threshold')
    .order('category')
    .order('name')
    .returns<InventoryItem[]>()

  return (
    <main className="p-6 space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <h1 className="text-xl font-bold">Admin — Inventory</h1>
        <div className="flex gap-4">
          <Link className="underline" href="/">Inventory View</Link>
          <Link className="underline" href="/crafting">Crafting</Link>
          <Link className="underline" href="/admin/recipes">Recipes</Link>
        </div>
      </div>

      {error ? <p>❌ Failed to load inventory: {error.message}</p> : null}

      <AddItemForm />

      <section className="space-y-3">
        <h2 className="font-semibold">Edit Existing Items</h2>
        <div className="hidden md:grid md:grid-cols-8 gap-2 px-3 py-2 text-xs uppercase tracking-wide opacity-70 border border-white/10 rounded">
        <div className="md:col-span-2">Item</div>
        <div>Stock</div>
        <div>Low ≤</div>
        <div className="md:col-span-2">Location</div>
        <div className="md:col-span-2">Notes</div>
        <div className="text-right">Action</div>
        </div>

        <div className="space-y-3">
          {(data ?? []).map((item) => (
            <InventoryRowForm
              key={item.id}
              id={item.id}
              name={item.name}
              category={item.category}
              stock={item.stock ?? 0}
              low_stock_threshold={item.low_stock_threshold ?? 2}
              location={item.location}
              notes={item.notes}
            />
          ))}
        </div>
      </section>
    </main>
  )
}
