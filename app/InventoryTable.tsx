'use client'

import { useMemo, useState } from 'react'

export type InventoryItem = {
  id: string
  name: string
  category: string
  stock: number
  location: string | null
  notes: string | null
  low_stock_threshold: number
}

function categoryChipClass(category: string) {
  const c = (category ?? '').toLowerCase()

  if (c.includes('engine')) return 'bg-red-500/15 border-red-500/30'
  if (c.includes('trans')) return 'bg-blue-500/15 border-blue-500/30'
  if (c.includes('susp')) return 'bg-purple-500/15 border-purple-500/30'
  if (c.includes('brake')) return 'bg-yellow-500/15 border-yellow-500/30'
  if (c.includes('body')) return 'bg-green-500/15 border-green-500/30'
  if (c.includes('elect')) return 'bg-cyan-500/15 border-cyan-500/30'

  return 'bg-white/5 border-white/10'
}

function lowStockRowClass(low: boolean) {
  // Soft red highlight + subtle border glow
  return low ? 'bg-red-500/10 hover:bg-red-500/20 ring-1 ring-red-500/30' : ''
}

export default function InventoryTable({ items }: { items: InventoryItem[] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category).filter(Boolean))
    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))]
  }, [items])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((i) => {
      const matchQ =
        !q ||
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        (i.location ?? '').toLowerCase().includes(q) ||
        (i.notes ?? '').toLowerCase().includes(q)

      const matchCat = category === 'All' || i.category === category
      return matchQ && matchCat
    })
  }, [items, query, category])

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Inventory</h2>
          <p className="text-sm opacity-70">{filtered.length} items</p>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search item, category, location, notes…"
            className="w-full md:w-80 rounded-lg bg-black/40 border border-white/10 px-3 py-2"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full md:w-56 rounded-lg bg-black/40 border border-white/10 px-3 py-2"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left">
              <tr className="text-xs uppercase tracking-wide opacity-80">
                <th className="p-3">Item</th>
                <th className="p-3">Category</th>
                <th className="p-3">Location</th>
                <th className="p-3 text-right">Stock</th>
                <th className="p-3">Notes</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((i, idx) => {
                const threshold = typeof i.low_stock_threshold === 'number' ? i.low_stock_threshold : 2
                const low = i.stock <= threshold

                return (
                  <tr
                    key={i.id}
                    className={[
                      'border-t border-white/10 transition-colors',
                      idx % 2 === 0 ? 'bg-white/[0.02]' : '',
                      lowStockRowClass(low),
                    ].join(' ')}
                  >
                    <td className="p-3 font-medium">{i.name}</td>

                    <td className="p-3">
                      <span
                        className={[
                          'inline-flex items-center rounded-full border px-2 py-1 text-xs',
                          categoryChipClass(i.category),
                        ].join(' ')}
                      >
                        {i.category}
                      </span>
                    </td>

                    <td className="p-3 opacity-80">{i.location ?? '—'}</td>

                    <td className="p-3 text-right">
                      <span className={['font-mono', low ? 'text-red-400 font-bold' : ''].join(' ')}>
                        {i.stock}
                      </span>

                      <span className="ml-2 text-xs opacity-70">low ≤ {threshold}</span>

                      {low ? (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/20 px-2 py-0.5 text-xs text-red-300 animate-pulse">
                          ⚠ LOW
                        </span>
                      ) : null}
                    </td>

                    <td className="p-3 opacity-70">{i.notes ?? '—'}</td>
                  </tr>
                )
              })}

              {filtered.length === 0 ? (
                <tr>
                  <td className="p-4 opacity-70" colSpan={5}>
                    No items match your search.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
