'use client'

import { useMemo, useState } from 'react'
import { useFormState } from 'react-dom'
import SubmitButton from './SubmitButton'
import { saveRecipeAction } from './actions'

type CraftedItem = { id: string; name: string }
type InventoryItem = { id: string; name: string; category: string }

export default function RecipeBuilder({
  craftedItems,
  inventoryItems,
}: {
  craftedItems: CraftedItem[]
  inventoryItems: InventoryItem[]
}) {
  const [craftedId, setCraftedId] = useState<string>(craftedItems[0]?.id ?? '')
  const [tier, setTier] = useState<number>(1)

  // id -> qty (if present, it’s selected)
  const [selected, setSelected] = useState<Record<string, number>>({})

  const [state, formAction] = useFormState(saveRecipeAction, { ok: false, message: '' })

  const grouped = useMemo(() => {
    const map = new Map<string, InventoryItem[]>()
    for (const item of inventoryItems) {
      if (!map.has(item.category)) map.set(item.category, [])
      map.get(item.category)!.push(item)
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [inventoryItems])

  const componentsJson = useMemo(() => {
    const arr = Object.entries(selected)
      .filter(([_, qty]) => qty > 0)
      .map(([inventory_item_id, qty_required]) => ({ inventory_item_id, qty_required }))
    return JSON.stringify(arr)
  }, [selected])

  function toggleItem(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = { ...prev }
      if (checked) next[id] = next[id] ?? 1
      else delete next[id]
      return next
    })
  }

  function setQty(id: string, qty: number) {
    setSelected((prev) => ({ ...prev, [id]: qty }))
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Admin — Recipe Builder</h1>

      {craftedItems.length === 0 ? (
        <p>❌ No crafted items found. Add some in Supabase first.</p>
      ) : null}

      <form action={formAction} className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3 max-w-3xl border border-white/10 rounded p-4">
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Crafted Item</label>
            <select
              className="w-full rounded bg-black border border-white/20 p-2"
              value={craftedId}
              onChange={(e) => setCraftedId(e.target.value)}
            >
              {craftedItems.map((c) => (
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

          {/* Hidden values for server action */}
          <input type="hidden" name="crafted_item_id" value={craftedId} />
          <input type="hidden" name="tier" value={tier} />
          <input type="hidden" name="components_json" value={componentsJson} />

          <div className="md:col-span-3 flex items-center justify-between gap-3">
            <div className="text-sm">
              {state.message ? (
                <span>{state.ok ? '✅ ' : '❌ '}{state.message}</span>
              ) : (
                <span className="opacity-80">Select components + qty, then save.</span>
              )}
            </div>
            <SubmitButton idle="Save Recipe" pending="Saving..." />
          </div>
        </div>

        <div className="space-y-4">
          {grouped.map(([category, items]) => (
            <section key={category} className="border border-white/10 rounded p-4">
              <h2 className="font-semibold mb-3">{category}</h2>

              <div className="space-y-2">
                {items.map((item) => {
                  const isChecked = selected[item.id] != null
                  const qty = selected[item.id] ?? 1
                  return (
                    <div key={item.id} className="grid gap-2 md:grid-cols-6 items-center border-t border-white/10 pt-2">
                      <label className="md:col-span-3 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => toggleItem(item.id, e.target.checked)}
                        />
                        <span>{item.name}</span>
                      </label>

                      <div className="md:col-span-2">
                        <input
                          type="number"
                          min={1}
                          disabled={!isChecked}
                          value={qty}
                          onChange={(e) => setQty(item.id, Number(e.target.value))}
                          className="w-full rounded bg-black border border-white/20 p-2 disabled:opacity-50"
                          placeholder="Qty"
                        />
                      </div>

                      <div className="text-sm opacity-70">per craft</div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </form>
    </main>
  )
}
