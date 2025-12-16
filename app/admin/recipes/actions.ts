'use server'

import { supabaseServer } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'

type ComponentInput = {
  inventory_item_id: string
  qty_required: number
}

export async function saveRecipeAction(_prev: any, formData: FormData) {
  try {
    const crafted_item_id = String(formData.get('crafted_item_id') ?? '')
    const tier = Number(formData.get('tier') ?? 1)

    const componentsRaw = String(formData.get('components_json') ?? '[]')
    const components = JSON.parse(componentsRaw) as ComponentInput[]

    if (!crafted_item_id) return { ok: false, message: 'Pick a crafted item.' }
    if (!(tier >= 1 && tier <= 5)) return { ok: false, message: 'Tier must be 1–5.' }

    const cleaned = (components ?? [])
      .filter((c) => c?.inventory_item_id && Number(c.qty_required) > 0)
      .map((c) => ({ inventory_item_id: String(c.inventory_item_id), qty_required: Number(c.qty_required) }))

    if (cleaned.length === 0) return { ok: false, message: 'Select at least 1 component with qty > 0.' }

    // 1) Ensure recipe exists (crafted_item_id + tier)
    const existing = await supabaseServer
      .from('recipes')
      .select('id')
      .eq('crafted_item_id', crafted_item_id)
      .eq('tier', tier)
      .limit(1)

    if (existing.error) return { ok: false, message: existing.error.message }

    let recipeId = existing.data?.[0]?.id as string | undefined

    if (!recipeId) {
      const created = await supabaseServer
        .from('recipes')
        .insert({ crafted_item_id, tier })
        .select('id')
        .single()

      if (created.error) return { ok: false, message: created.error.message }
      recipeId = created.data.id
    }

    // 2) Replace components (delete then insert)
    const del = await supabaseServer.from('recipe_components').delete().eq('recipe_id', recipeId)
    if (del.error) return { ok: false, message: del.error.message }

    const ins = await supabaseServer
      .from('recipe_components')
      .insert(cleaned.map((c) => ({ recipe_id: recipeId, ...c })))

    if (ins.error) return { ok: false, message: ins.error.message }

    revalidatePath('/admin/recipes')
    revalidatePath('/crafting')

    return { ok: true, message: 'Recipe saved ✅' }
  } catch (e: any) {
    return { ok: false, message: e?.message ?? 'Failed to save recipe.' }
  }
}
