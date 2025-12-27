import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabaseServer'
import RecipesClient from './RecipesClient'

export type CraftedItem = { id: string; name: string }
export type InventoryItem = { id: string; name: string; category: string; stock: number }

export default async function AdminRecipesPage() {
  // Keep your existing admin PIN gate for now
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get('admin')?.value === '1'
  if (!isAdmin) redirect('/admin')

  const supabase = await supabaseServer()

  const { data: craftedItems, error: craftedErr } = await supabase
    .from('crafted_items')
    .select('id,name')
    .order('name')
    .returns<CraftedItem[]>()

  const { data: inventoryItems, error: invErr } = await supabase
    .from('inventory_items')
    .select('id,name,category,stock')
    .order('category')
    .order('name')
    .returns<InventoryItem[]>()

  return (
    <main className="p-6 space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <h1 className="text-xl font-bold">Admin — Recipes</h1>
        <div className="flex gap-4">
          <Link className="underline" href="/">Inventory View</Link>
          <Link className="underline" href="/crafting">Crafting</Link>
          <Link className="underline" href="/admin/inventory">Admin Inventory</Link>
        </div>
      </div>

      {craftedErr ? <p>❌ Crafted items error: {craftedErr.message}</p> : null}
      {invErr ? <p>❌ Inventory items error: {invErr.message}</p> : null}

      <RecipesClient
        craftedItems={craftedItems ?? []}
        inventoryItems={inventoryItems ?? []}
      />
    </main>
  )
}
