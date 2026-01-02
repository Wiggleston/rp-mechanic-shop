import Link from 'next/link'
import { supabaseServer } from '@/lib/supabaseServer'
import { requireRole } from '@/lib/requireRole'
import RecipeBuilder from './RecipeBuilder'

export type CraftedItem = { id: string; name: string }
export type InventoryItem = { id: string; name: string; category: string; stock: number }

export default async function AdminRecipesPage() {
  // 🔐 Role-based access (replaces Admin PIN)
  const role = await requireRole(['manager', 'admin'], '/admin/recipes')

  const supabase = supabaseServer

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

          {(role === 'manager' || role === 'admin') && (
            <Link className="underline" href="/admin/inventory">
              Admin Inventory
            </Link>
          )}

          {role === 'admin' && (
            <Link className="underline" href="/admin/users">
              User Management
            </Link>
          )}
        </div>
      </div>

      {craftedErr && <p>❌ Crafted items error: {craftedErr.message}</p>}
      {invErr && <p>❌ Inventory items error: {invErr.message}</p>}

      <RecipeBuilder
        craftedItems={craftedItems ?? []}
        inventoryItems={inventoryItems ?? []}
      />
    </main>
  )
}
