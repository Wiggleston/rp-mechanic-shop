'use client'

import { useMemo, useState } from 'react'
import { useFormState } from 'react-dom'
import type { CraftedItem, InventoryItem } from './page'
import SubmitButton from '../inventory/SubmitButton'
import { loadRecipeComponentsAction, upsertRecipeAction } from './actions'

type LoadedComp = { inventory_item_id: string; qty_required: number }

export default function RecipesClient(props: {
  craftedItems: CraftedItem[]
  inventoryItems: InventoryItem[]
}) {
  const [craftedItemId, setCraftedItemId] = useState(props.craftedItems[0]?.id ?? '')
  const [tier, setTier] = useState<number>(1)

  // selection state: itemId -> qty_required
  const [selected, setSelected] = useState<Record<string, number>>({})

  const [saveState, saveAction] = useFormState(upsertRecipeAction, { ok: false, message: '' })
  const [loadState, loadAction] = useFormState(loadRecipeComponentsAction, {
    ok: false,
    message: '',
    components: [] as LoadedComp[],
  })

  const grouped = useMemo(() => {
    const map = new Map<string, InventoryItem[]>()
    for (const it of props.inventoryItems) {
      const key = it.category || 'Other'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(it)
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [props.inventoryItems])

  function toggle(id: string, on: boolean) {
    setSelected((prev) => {
      const next = { ...prev }
      if (!on) delete next[id]
      else next[id] = next[id] ?? 1
      return next
    })
  }

  function setQty(id: string, qty: number) {
    setSelected((prev) => ({ ...prev, [id]: qty }))
  }

  // When loadState.components changes, apply it to selected
  useMemo(() => {
    if (!loadState?.components) return
    const next: Record<string, number> = {}
    for (const c of loadState.components) next[c.inventory_item_id] = c.qty_required
    setSelected(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(loadState.components)])

  const componentsJson = useMemo(() => {
    return JSON.stringify(
      Object.entries(selected).map(([inventory_item_id, qty_required]) => ({
        inventory_item_id,
        qty_required,
      }))
    )
  }, [selected])

  return (
    <div className="space-y-6">
      <section className="max-w-3xl border border-white/10 rounded p-4 space-y-3">
        <h2 className="font-semibold">Recipe Builder</h2>

        <div className="grid gap-3 md:grid-cols-3 items-end">
          <div>
            <label className="block text-sm mb-1">Crafted Item</label>
            <select
              className="w-full rounded bg-black border border-white/20 p-2"
              value={craftedItemId}
              onChange={(e) => setCraftedItemId(e.target.value)}
            >
              {props.craftedItems.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
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

          {/* Load existing */}
          <form action={loadAction} className="flex justify-end">
            <input type="hidden" name="crafted_item_id" value={craftedItemId} />
            <input type="hidden" name="tier" value={tier} />
            <SubmitButton idleText="Load Existing" pendingText="Loading..." />
          </form>
        </div>

        {loadState.message ? (
          <p className="text-sm whitespace-pre-line">{loadState.ok ? '✅ ' : '❌ '}{loadState.message}</p>
        ) : null}
      </section>

      {/* Inventory picker */}
      <section className="border border-white/10 rounded p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Select Components</h2>
          <div className="text-sm opacity-70">
            Selected: {Object.keys(selected).length}
          </div>
        </div>

        <div className="space-y-5">
          {grouped.map(([cat, items]) => (
            <div key={cat} className="space-y-2">
              <div className="text-sm font-semibold opacity-80">{cat}</div>

              <div className="grid gap-2 md:grid-cols-2">
                {items.map((it) => {
                  const checked = selected[it.id] != null
                  return (
                    <div
                      key={it.id}
                      className="flex items-center justify-between gap-3 rounded border border-white/10 bg-white/[0.03] p-3"
                    >
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => toggle(it.id, e.target.checked)}
                        />
                        <span className="font-medium">{it.name}</span>
                        <span className="text-xs opacity-70">(stock {it.stock})</span>
                      </label>

                      <input
                        type="number"
                        min={1}
                        disabled={!checked}
                        value={checked ? selected[it.id] : 1}
                        onChange={(e) => setQty(it.id, Number(e.target.value))}
                        className="w-20 rounded bg-black border border-white/20 p-2 text-right disabled:opacity-40"
                        title="Qty required"
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Save */}
      <section className="max-w-3xl border border-white/10 rounded p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Save Recipe</h2>
          <div className="text-sm opacity-70">
            {craftedItemId ? 'Ready' : 'Pick an item'}
          </div>
        </div>

        {saveState.message ? (
          <p className="text-sm whitespace-pre-line">{saveState.ok ? '✅ ' : '❌ '}{saveState.message}</p>
        ) : null}

        <form action={saveAction} className="flex justify-end">
          <input type="hidden" name="crafted_item_id" value={craftedItemId} />
          <input type="hidden" name="tier" value={tier} />
          <input type="hidden" name="components_json" value={componentsJson} />
          <SubmitButton idleText="Save Recipe" pendingText="Saving..." />
        </form>
      </section>
    </div>
  )
}
