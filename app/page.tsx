import { supabase } from '@/lib/supabase'

type InventoryItem = {
  id: string
  name: string
  category: string
  stock: number
  location: string | null
  notes: string | null
}

export default async function Home() {
  const { data } = await supabase
    .from('inventory_items')
    .select('*')
    .returns<InventoryItem[]>()

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold">Inventory</h1>
      <ul>
        {data?.map(item => (
          <li key={item.id}>
            {item.name}: {item.stock}
          </li>
        ))}
      </ul>
    </main>
  )
}
