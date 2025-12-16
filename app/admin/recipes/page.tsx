import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabaseServer'
import RecipeBuilder from './RecipeBuilder'

export default async function AdminRecipesPage() {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get('admin')?.value === '1'
  if (!isAdmin) redirect('/admin')

  const craftedRes = await supabaseServer.from('crafted_items').select('id,name').order('name')
  const invRes = await supabaseServer.from('inventory_items').select('id,name,category').order('category').order('name')

  if (craftedRes.error) return <main className="p-6">❌ {craftedRes.error.message}</main>
  if (invRes.error) return <main className="p-6">❌ {invRes.error.message}</main>

  return (
    <RecipeBuilder craftedItems={craftedRes.data ?? []} inventoryItems={invRes.data ?? []} />
  )
}
