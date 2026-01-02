'use server'

import { supabaseServer } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'

export async function upsertRecipeAction(_prev: any, formData: FormData) {
  try {
    const crafted_item_id = String(formData.get('crafted_item_id') ?? '')
    const tier = Number(formData.get('tier') ?? 1)

    if (!crafted_item_id) return { ok: false, message: 'Pick a crafted item.' }
    if (tier < 1 || tier > 5) return { ok: false, message: 'Tier must be 1–5.' }

    const raw = String(formData.get('components_json') ?? '')
    const components = JSON.parse(raw) as Array<{ inventory_item_id: string; qty_required: number }>

    if (!Array.isArray(components) || components.length === 0) {
      return { ok: false, message: 'Select at least 1 component.' }
    }

    // sanitize
    const cleaned = components
      .map((c) => ({
        inventory_item_id: String(c.inventory_item_id),
        qty_required: Number(c.qty_required),
      }))
      .filter((c) => c.inventory_item_id && Number.isFinite(c.qty_required) && c.qty_required > 0)

    if (cleaned.length === 0) return { ok: false, message: 'All component quantities must be > 0.' }

    const supabase = supabaseServer

    // 1) Find existing recipe
    const { data: existing, error: exErr } = await supabase
      .from('recipes')
      .select('id')
      .eq('crafted_item_id', crafted_item_id)
      .eq('tier', tier)
      .limit(1)

    if (exErr) return { ok: false, message: exErr.message }

    let recipeId = existing?.[0]?.id as string | undefined

    // 2) Create recipe if missing
    if (!recipeId) {
      const { data: created, error: createErr } = await supabase
        .from('recipes')
        .insert({ crafted_item_id, tier })
        .select('id')
        .single()

      if (createErr) return { ok: false, message: createErr.message }
      recipeId = created.id
    }

    // 3) Replace components (simple + reliable)
    const { error: delErr } = await supabase
      .from('recipe_components')
      .delete()
      .eq('recipe_id', recipeId)

    if (delErr) return { ok: false, message: delErr.message }

    const { error: insErr } = await supabase
      .from('recipe_components')
      .insert(cleaned.map((c) => ({ recipe_id: recipeId, ...c })))

    if (insErr) return { ok: false, message: insErr.message }

    revalidatePath('/admin/recipes')
    revalidatePath('/crafting')
    return { ok: true, message: 'Recipe saved ✅' }
  } catch (e: any) {
    return { ok: false, message: e?.message ?? 'Failed to save recipe.' }
  }
}

export async function loadRecipeComponentsAction(_prev: any, formData: FormData) {
  try {
    const crafted_item_id = String(formData.get('crafted_item_id') ?? '')
    const tier = Number(formData.get('tier') ?? 1)
    if (!crafted_item_id) return { ok: false, message: 'Pick a crafted item.', components: [] }

    const supabase = supabaseServer

    const { data: recipe, error: recipeErr } = await supabase
      .from('recipes')
      .select('id')
      .eq('crafted_item_id', crafted_item_id)
      .eq('tier', tier)
      .limit(1)
      .maybeSingle()

    if (recipeErr) return { ok: false, message: recipeErr.message, components: [] }
    if (!recipe?.id) return { ok: true, message: 'No recipe yet for this item+tier.', components: [] }

    const { data: comps, error: compsErr } = await supabase
      .from('recipe_components')
      .select('inventory_item_id,qty_required')
      .eq('recipe_id', recipe.id)

    if (compsErr) return { ok: false, message: compsErr.message, components: [] }

    return { ok: true, message: 'Loaded ✅', components: comps ?? [] }
  } catch (e: any) {
    return { ok: false, message: e?.message ?? 'Failed to load recipe.', components: [] }
  }
}
