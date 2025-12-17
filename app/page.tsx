import Link from 'next/link'
import InventoryTable, { type InventoryItem } from './InventoryTable'
import { supabaseServer } from '@/lib/supabaseServer'

export default async function Home() {
  const { data, error } = await supabaseServer
    .from('inventory_items')
    .select('id,name,category,stock,location,notes,low_stock_threshold')
    .order('category')
    .order('name')
    .returns<InventoryItem[]>()

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <div className="flex gap-4">
          <Link className="underline" href="/crafting">Crafting</Link>
          <Link className="underline" href="/admin">Admin</Link>
        </div>
      </div>

      {error ? <p>❌ {error.message}</p> : null}

      <InventoryTable items={data ?? []} />
    </main>
  )
}
