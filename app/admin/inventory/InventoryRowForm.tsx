'use client'

import { useEffect } from 'react'
import { useFormState } from 'react-dom'
import SubmitButton from './SubmitButton'
import { updateItemAction } from './actions'

export default function InventoryRowForm({
  id,
  name,
  category,
  stock,
  location,
  notes,
}: {
  id: string
  name: string
  category: string
  stock: number
  location: string | null
  notes: string | null
}) {
  const [state, formAction] = useFormState(updateItemAction, { ok: false, message: '' })

  // Optional: auto-clear message after a few seconds
  useEffect(() => {
    if (!state.message) return
    const t = setTimeout(() => {
      // can't mutate state directly; leaving this out is fine.
    }, 2500)
    return () => clearTimeout(t)
  }, [state.message])

  return (
    <form action={formAction} className="grid gap-2 md:grid-cols-6 border border-white/10 rounded p-3">
      <input type="hidden" name="id" value={id} />

      <div className="md:col-span-2">
        <div className="font-semibold">{name}</div>
        <div className="text-sm opacity-80">{category}</div>
        {state.message ? (
          <div className="text-sm mt-1">{state.ok ? '✅ ' : '❌ '}{state.message.replace(/^✅\s?|^❌\s?/, '')}</div>
        ) : null}
      </div>

      <input name="stock" type="number" defaultValue={stock} className="rounded bg-black border border-white/20 p-2" />
      <input name="location" defaultValue={location ?? ''} className="rounded bg-black border border-white/20 p-2" />
      <input name="notes" defaultValue={notes ?? ''} className="rounded bg-black border border-white/20 p-2 md:col-span-2" />

      <SubmitButton idleText="Save" pendingText="Saving..." />
    </form>
  )
}
