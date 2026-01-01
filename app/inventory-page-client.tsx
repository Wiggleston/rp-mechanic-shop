'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import InventoryTable, { InventoryItem } from './InventoryTable'

export default function InventoryPageClient() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError('')

      const { data: userRes } = await supabase.auth.getUser()
      if (!userRes.user) {
        window.location.href = '/login'
        return
      }

      const { data, error } = await supabase
        .from('inventory_items')
        .select('id,name,category,stock,location,notes,low_stock_threshold')
        .order('category')
        .order('name')
        .returns<InventoryItem[]>()

      if (!mounted) return

      if (error) setError(error.message)
      setItems(data ?? [])
      setLoading(false)
    }

    load()

    const { data: sub } = supabase.auth.onAuthStateChange(() => load())

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Inventory</h1>
        <Link className="underline" href="/crafting">Crafting</Link>
      </div>

      {loading ? <p className="opacity-70">Loading…</p> : null}
      {error ? <p>❌ {error}</p> : null}

      {!loading && !error ? <InventoryTable items={items} /> : null}
    </main>
  )
}
