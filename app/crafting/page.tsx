import CraftForm from './CraftForm'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type CraftedItem = {
  id: string
  name: string
}

export default async function CraftingPage() {
  const { data, error } = await supabase
    .from('crafted_items')
    .select('id, name')
    .order('name')
    .returns<CraftedItem[]>()

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-bold">Crafting</h1>
        <p className="mt-4">❌ Failed to load crafted items: {error.message}</p>
      </main>
    )
  }

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Crafting</h1>
      <Link className="underline" href="/">Back to Inventory</Link>
      <CraftForm craftedItems={data ?? []} />
    </main>
  )
}
