import Link from 'next/link'
import { supabaseServer } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'

async function updateItem(formData: FormData) {
  'use server'
  const id = String(formData.get('id'))
  const stock = Number(formData.get('stock'))
  const location = String(formData.get('location') ?? '')
  const notes = String(formData.get('notes') ?? '')

  await supabaseServer
    .from('inventory_items')
    .update({ stock, location, notes })
    .eq('id', id)

  revalidatePath('/admin/inventory')
  revalidatePath('/') // inventory view
  revalidatePath('/crafting') // preview uses inventory
}

async function addItem(formData: FormData) {
  'use server'
  const name = String(formData.get('name'))
  const category = String(formData.get('category'))
  const stock = Number(formData.get('stock') ?? 0)
  const location = String(formData.get('location') ?? '')
  const notes = String(formData.get('notes') ?? '')

  await supabaseServer.from('inventory_items').insert({ name, category, stock, location, notes })

  revalidatePath('/admin/inventory')
  revalidatePath('/')
}

export default async function AdminInventory() {
  const { data } = await supabaseServer
    .from('inventory_items')
    .select('id,name,category,stock,location,notes')
    .order('category')
    .order('name')

  return (
    <main className="p-6">
      <div className="flex gap-4 items-center mb-4">
        <h1 className="text-xl font-bold">Admin — Inventory</h1>
        <Link className="underline" href="/admin/recipes">Recipes</Link>
        <Link className="underline" href="/">Inventory View</Link>
        <Link className="underline" href="/crafting">Crafting</Link>
      </div>

      <section className="mb-8 max-w-2xl">
        <h2 className="font-semibold mb-2">Add Item</h2>
        <form action={addItem} className="grid gap-2 md:grid-cols-5">
          <input name="name" placeholder="Name" className="rounded bg-black border border-white/20 p-2 md:col-span-2" />
          <input name="category" placeholder="Category" className="rounded bg-black border border-white/20 p-2" />
          <input name="stock" type="number" placeholder="Stock" className="rounded bg-black border border-white/20 p-2" />
          <input name="location" placeholder="Location" className="rounded bg-black border border-white/20 p-2" />
          <input name="notes" placeholder="Notes" className="rounded bg-black border border-white/20 p-2 md:col-span-5" />
          <button className="rounded bg-white text-black font-semibold p-2 md:col-span-2">Add</button>
        </form>
      </section>

      <h2 className="font-semibold mb-2">Edit Items</h2>
      <div className="space-y-3">
        {data?.map((item) => (
          <form key={item.id} action={updateItem} className="grid gap-2 md:grid-cols-6 border border-white/10 p-3 rounded">
            <input type="hidden" name="id" value={item.id} />
            <div className="md:col-span-2">
              <div className="font-semibold">{item.name}</div>
              <div className="text-sm opacity-80">{item.category}</div>
            </div>
            <input name="stock" type="number" defaultValue={item.stock} className="rounded bg-black border border-white/20 p-2" />
            <input name="location" defaultValue={item.location ?? ''} className="rounded bg-black border border-white/20 p-2" />
            <input name="notes" defaultValue={item.notes ?? ''} className="rounded bg-black border border-white/20 p-2 md:col-span-2" />
            <button className="rounded bg-white text-black font-semibold p-2">Save</button>
          </form>
        ))}
      </div>
    </main>
  )
}
