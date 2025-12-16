'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

type CraftedItem = {
  id: string
  name: string
}

type RecipeRow = {
  id: string
}

type RecipeComponentRow = {
  inventory_item_id: string
  qty_required: number
}

type InventoryItemRow = {
  id: string
  name: string
  stock: number
  location: string | null
}

type PreviewLine = {
  id: string
  name: string
  location: string | null
  stock: number
  qtyRequiredPerCraft: number
  qtyNeededForThisOrder: number
  shortBy: number
}

export default function CraftForm({ craftedItems }: { craftedItems: CraftedItem[] }) {
  const [craftedItemId, setCraftedItemId] = useState<string>(craftedItems[0]?.id ?? '')
  const [tier, setTier] = useState<number>(1)
  const [quantity, setQuantity] = useState<number>(1)


  // Preview state
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string>('')
  const [previewLines, setPreviewLines] = useState<PreviewLine[]>([])
  const [maxCraftable, setMaxCraftable] = useState<number | null>(null)

  // Fetch + build preview whenever selection changes
  useEffect(() => {
    async function loadPreview() {
      setPreviewError('')
      setPreviewLines([])
      setMaxCraftable(null)

      if (!craftedItemId) return
      if (tier < 1 || tier > 5) return
      if (quantity < 1) return

      setPreviewLoading(true)

      try {
        // 1) Find the recipe for (crafted item + tier)
        const recipeRes = await supabase
          .from('recipes')
          .select('id')
          .eq('crafted_item_id', craftedItemId)
          .eq('tier', tier)
          .limit(1)
          .returns<RecipeRow[]>()

        if (recipeRes.error) throw new Error(recipeRes.error.message)

        const recipeId = recipeRes.data?.[0]?.id
        if (!recipeId) {
          setPreviewError('No recipe found for this item + tier yet.')
          return
        }

        // 2) Get required components for that recipe
        const compsRes = await supabase
          .from('recipe_components')
          .select('inventory_item_id, qty_required')
          .eq('recipe_id', recipeId)
          .returns<RecipeComponentRow[]>()

        if (compsRes.error) throw new Error(compsRes.error.message)

        const components = compsRes.data ?? []
        if (components.length === 0) {
          setPreviewError('Recipe exists, but has no components yet.')
          return
        }

        // 3) Fetch inventory items in one query using IN (...)
        const itemIds = components.map((c) => c.inventory_item_id)

        const invRes = await supabase
          .from('inventory_items')
          .select('id, name, stock, location')
          .in('id', itemIds)
          .returns<InventoryItemRow[]>()

        if (invRes.error) throw new Error(invRes.error.message)

        const invMap = new Map((invRes.data ?? []).map((row) => [row.id, row]))

        // 4) Build preview lines
        const lines: PreviewLine[] = components
          .map((c) => {
            const inv = invMap.get(c.inventory_item_id)
            const stock = inv?.stock ?? 0
            const qtyNeeded = c.qty_required * quantity
            const shortBy = Math.max(0, qtyNeeded - stock)

            return {
              id: c.inventory_item_id,
              name: inv?.name ?? '(Missing inventory item)',
              location: inv?.location ?? null,
              stock,
              qtyRequiredPerCraft: c.qty_required,
              qtyNeededForThisOrder: qtyNeeded,
              shortBy
            }
          })
          .sort((a, b) => a.name.localeCompare(b.name))

        setPreviewLines(lines)

        // 5) Max craftable = min(floor(stock / qty_required_per_craft))
        const craftable = lines
          .map((l) => (l.qtyRequiredPerCraft > 0 ? Math.floor(l.stock / l.qtyRequiredPerCraft) : 0))
          .reduce((min, val) => Math.min(min, val), Number.POSITIVE_INFINITY)

        setMaxCraftable(Number.isFinite(craftable) ? craftable : 0)
      } catch (e: any) {
        setPreviewError(e?.message ?? 'Failed to load preview.')
      } finally {
        setPreviewLoading(false)
      }
    }

    loadPreview()
  }, [craftedItemId, tier, quantity])

  const canCraft = useMemo(() => {
    if (!craftedItemId) return false
    if (quantity < 1) return false
    if (maxCraftable === null) return false
    return quantity <= maxCraftable
  }, [craftedItemId, quantity, maxCraftable])

  return (
    <div className="max-w-2xl space-y-4 rounded-lg border border-white/10 p-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm mb-1">Crafted Item</label>
          <select
            className="w-full rounded bg-black border border-white/20 p-2"
            value={craftedItemId}
            onChange={(e) => setCraftedItemId(e.target.value)}
          >
            {craftedItems.length === 0 ? (
              <option value="">(No crafted items found)</option>
            ) : null}

            {craftedItems.map((ci) => (
              <option key={ci.id} value={ci.id}>
                {ci.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Tier</label>
          <select
            className="w-full rounded bg-black border border-white/20 p-2"
            value={tier}
            onChange={(e) => setTier(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Quantity</label>
          <input
            className="w-full rounded bg-black border border-white/20 p-2"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Preview */}
      <div className="rounded border border-white/10 p-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold">Craft Preview</h2>
          <div className="text-sm opacity-80">
            Max craftable:{' '}
            {previewLoading ? 'Loading…' : maxCraftable === null ? '—' : maxCraftable}
          </div>
        </div>

        {previewError ? (
          <p className="mt-2 text-sm">❌ {previewError}</p>
        ) : null}

        {!previewError && previewLines.length === 0 ? (
          <p className="mt-2 text-sm opacity-80">
            Select an item + tier to see required components.
          </p>
        ) : null}

        {previewLines.length > 0 ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="opacity-80">
                <tr>
                  <th className="text-left p-2">Component</th>
                  <th className="text-left p-2">Location</th>
                  <th className="text-right p-2">Have</th>
                  <th className="text-right p-2">Need</th>
                  <th className="text-right p-2">Short</th>
                </tr>
              </thead>
              <tbody>
                {previewLines.map((l) => (
                  <tr key={l.id} className="border-t border-white/10">
                    <td className="p-2">{l.name}</td>
                    <td className="p-2 opacity-80">{l.location ?? '—'}</td>
                    <td className="p-2 text-right">{l.stock}</td>
                    <td className="p-2 text-right">{l.qtyNeededForThisOrder}</td>
                    <td className="p-2 text-right">{l.shortBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!canCraft ? (
              <p className="mt-2 text-sm">⚠️ Not enough parts for this quantity.</p>
            ) : (
              <p className="mt-2 text-sm">✅ You have enough parts to craft this.</p>
            )}
          </div>
        ) : null}
      </div>

      {status ? <p className="text-sm opacity-90">{status}</p> : null}
    </div>
  )
}
