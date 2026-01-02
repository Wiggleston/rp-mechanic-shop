import Link from 'next/link'
import { supabaseServer } from '@/lib/supabaseServer'
import { requireRole } from '@/lib/requireRole'
import AddItemForm from './AddItemForm'
import BulkUpdateForm from './BulkUpdateForm'
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
  const role = await requireRole(['manager', 'admin'])

  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from('inventory_items')
    .select('id,name,category,stock,location,notes,low_stock_threshold')
    .order('category')
    .order('name')
    .returns<InventoryItem[]>()

  return (
    <main className="p-6 space-y-6">
      {/* ...same UI... */}
    </main>
  )
}
