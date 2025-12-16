'use server'

import { supabaseServer } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'

export async function updateItemAction(_prevState: any, formData: FormData) {
  try {
    const id = String(formData.get('id') ?? '')
    const stock = Number(formData.get('stock') ?? 0)
    const location = String(formData.get('location') ?? '')
    const notes = String(formData.get('notes') ?? '')

    if (!id) return { ok: false, message: 'Missing item id.' }

    const { error } = await supabaseServer
      .from('inventory_items')
      .update({ stock, location, notes })
      .eq('id', id)

    if (error) return { ok: false, message: error.message }

    revalidatePath('/admin/inventory')
    revalidatePath('/')
    revalidatePath('/crafting')
    return { ok: true, message: 'Saved ✅' }
  } catch (e: any) {
    return { ok: false, message: e?.message ?? 'Save failed.' }
  }
}

export async function addItemAction(_prevState: any, formData: FormData) {
  try {
    const name = String(formData.get('name') ?? '').trim()
    const category = String(formData.get('category') ?? '').trim()
    const stock = Number(formData.get('stock') ?? 0)
    const location = String(formData.get('location') ?? '')
    const notes = String(formData.get('notes') ?? '')

    if (!name || !category) return { ok: false, message: 'Name + Category required.' }

    const { error } = await supabaseServer
      .from('inventory_items')
      .insert({ name, category, stock, location, notes })

    if (error) return { ok: false, message: error.message }

    revalidatePath('/admin/inventory')
    revalidatePath('/')
    return { ok: true, message: 'Added ✅' }
  } catch (e: any) {
    return { ok: false, message: e?.message ?? 'Add failed.' }
  }
}
