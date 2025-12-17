'use server'

import { supabaseServer } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'

export async function updateItemAction(_prevState: any, formData: FormData) {
  try {
    const id = String(formData.get('id') ?? '')
    const stock = Number(formData.get('stock') ?? 0)
    const location = String(formData.get('location') ?? '')
    const notes = String(formData.get('notes') ?? '')
    const low_stock_threshold = Number(formData.get('low_stock_threshold') ?? 2)

    if (!id) return { ok: false, message: 'Missing item id.' }

    const { error } = await supabaseServer
      .from('inventory_items')
      .update({ stock, location, notes, low_stock_threshold })
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
    const low_stock_threshold = Number(formData.get('low_stock_threshold') ?? 2)

    if (!name || !category) return { ok: false, message: 'Name + Category required.' }

    const { error } = await supabaseServer
      .from('inventory_items')
      .insert({ name, category, stock, location, notes, low_stock_threshold })

    if (error) return { ok: false, message: error.message }

    revalidatePath('/admin/inventory')
    revalidatePath('/')
    return { ok: true, message: 'Added ✅' }
  } catch (e: any) {
    return { ok: false, message: e?.message ?? 'Add failed.' }
  }
}

export async function bulkUpdateStockAction(_prevState: any, formData: FormData) {
  try {
    const raw = String(formData.get('bulk') ?? '')
    if (!raw.trim()) return { ok: false, message: 'Paste at least one line.' }

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
      return {
        ok: false,
        message: `Bad lines (use "Item Name | Number"):\n${badLines.map((b) => b.line).join('\n')}`,
      }
    }

    const names = parsed.map((p) => p.name)

    const { data: items, error } = await supabaseServer
      .from('inventory_items')
      .select('id,name')
      .in('name', names)

    if (error) return { ok: false, message: error.message }

    const idByName = new Map((items ?? []).map((i) => [i.name, i.id]))
    const missing = parsed.filter((p) => !idByName.has(p.name)).map((p) => p.name)

    if (missing.length > 0) {
      return { ok: false, message: `These item names were not found:\n${missing.join('\n')}` }
    }

    for (const p of parsed) {
      const id = idByName.get(p.name)!
      const { error: updErr } = await supabaseServer
        .from('inventory_items')
        .update({ stock: p.stock })
        .eq('id', id)

      if (updErr) return { ok: false, message: `Failed updating "${p.name}": ${updErr.message}` }
    }

    revalidatePath('/admin/inventory')
    revalidatePath('/')
    revalidatePath('/crafting')

    return { ok: true, message: 'Bulk update applied ✅' }
  } catch (e: any) {
    return { ok: false, message: e?.message ?? 'Bulk update failed.' }
  }
}

