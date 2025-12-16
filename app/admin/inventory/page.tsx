import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { supabaseServer } from '@/lib/supabaseServer'
import AddItemForm from './AddItemForm'
import InventoryRowForm from './InventoryRowForm'


async function updateItem(formData: FormData) {
  'use server'

  const id = String(formData.get('id') ?? '')
  const stock = Number(formData.get('stock') ?? 0)
  const location = String(formData.get('location') ?? '')
  const notes = String(formData.get('notes') ?? '')

  if (!id) return

  await supabaseServer
    .from('inventory_items')
    .update({ stock, location, notes })
    .eq('id', id)

  revalidatePath('/admin/inventory')
  revalidatePath('/')
  revalidatePath('/crafting')
}

async function addItem(formData: FormData) {
  'use server'

  const name = String(formData.get('name') ?? '')
  const category = String(formData.get('category') ?? '')
  const stock = Number(formData.get('stock') ?? 0)
  const location = String(formData.get('location') ?? '')
  const notes = String(formData.get('notes') ?? '')

  if (!name || !category) return

  await supabaseServer
    .from('inventory_items')
    .insert({ name, category, stock, location, notes })

  revalidatePath('/admin/inventory')
  revalidatePath('/')
}

async function bulkUpdateStock(formData: FormData) {
  'use server'

  const raw = String(formData.get('bulk') ?? '')
  if (!raw.trim()) return

  // Parse lines like: "Engine Block | 10"
  const parsed = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('|').map((p) => p.trim())
      const name = parts[0] ?? ''
      const stock = Number(parts[1] ?? NaN)
      return { name, stock, line }
    })

  const badLines = parsed.filter((p) => !p.name || Number.isNaN(p.stock))
  if (badLines.length > 0) {
    // Stop early so you don’t accidentally half-apply.
    throw new Error(
      `Bad lines (use "Item Name | Number"):\n` + badLines.map((b) => b.line).join('\n')
    )
  }

  const names = parsed.map((p) => p.name)

  // Fetch all matching items once
  const { data: items, error } = await supabaseServer
    .from('inventory_items')
    .select('id,name')
    .in('name', names)

  if (error) throw new Error(error.message)

  const idByName = new Map((items ?? []).map((i) => [i.name, i.id]))
  const missing = parsed.filter((p) => !idByName.has(p.name)).map((p) => p.name)

  if (missing.length > 0) {
    // Don’t apply partial updates unless you want it.
    throw new Error(`These item names were not found:\n` + missing.join('\n'))
  }

  // Update each item (simple + clear)
  for (const p of parsed) {
    const id = idByName.get(p.name)!
    const { error: updErr } = await supabaseServer
      .from('inventory_items')
      .update({ stock: p.stock })
      .eq('id', id)

    if (updErr) throw new Error(`Failed updating "${p.name}": ${updErr.message}`)
  }

  revalidatePath('/admin/inventory')
  revalidatePath('/')
  revalidatePath('/crafting')
}


export default async function AdminInventoryPage() {
  // Gate
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get('admin')?.value === '1'
  if (!isAdmin) redirect('/admin')

  // Load inventory
  const { data, error } = await supabaseServer
    .from('inventory_items')
    .select('id,name,category,stock,location,notes')
    .order('category')
    .order('name')

  return (
    <main className="p-6 space-y-6">
      <div className="flex flex-wrap gap-4 items-center">
        <h1 className="text-xl font-bold">Admin — Inventory</h1>
        <Link className="underline" href="/">Inventory View</Link>
        <Link className="underline" href="/crafting">Crafting</Link>
        <Link className="underline" href="/admin/recipes">Recipes</Link>
      </div>

      {error ? (
        <p>❌ Failed to load inventory: {error.message}</p>
      ) : null}

      <AddItemForm />

      {/*Bulk Items*/}
<section className="max-w-3xl border border-white/10 rounded p-4">
  <h2 className="font-semibold mb-2">Bulk Update Stock</h2>
  <p className="text-sm opacity-80 mb-3">
    Paste lines like <span className="font-mono">Engine Block | 10</span> (names must match exactly).
  </p>

  <form action={bulkUpdateStock} className="space-y-3">
    <textarea
      name="bulk"
      rows={10}
      placeholder={`Engine Block | 10\nPistons | 40\nCrankshaft | 8`}
      className="w-full rounded bg-black border border-white/20 p-2 font-mono"
    />
    <button className="rounded bg-white text-black font-semibold p-2">
      Apply Bulk Update
    </button>
  </form>
</section>

      {/* Edit Items */}
      <section className="space-y-3">
        <h2 className="font-semibold">Edit Existing Items</h2>
        <div className="space-y-3">
          {(data ?? []).map((item) => (
            <InventoryRowForm
                key={item.id}
                id={item.id}
                name={item.name}
                category={item.category}
                stock={item.stock ?? 0}
                location={item.location}
                notes={item.notes}
            />
          ))}
        </div>
      </section>
    </main>
  )
}
