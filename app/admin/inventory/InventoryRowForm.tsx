'use client'

import { useFormState } from 'react-dom'
import SubmitButton from './SubmitButton'
import { updateItemAction } from './actions'

export default function InventoryRowForm(props: {
  id: string
  name: string
  category: string
  stock: number
  location: string | null
  notes: string | null
  low_stock_threshold: number
}) {
  const [state, formAction] = useFormState(updateItemAction, { ok: false, message: '' })

  return (
    <form action={formAction} className="grid gap-2 md:grid-cols-8 border border-white/10 rounded p-3">
      <input type="hidden" name="id" value={props.id} />

      <div className="md:col-span-2">
        <div className="font-semibold">{props.name}</div>
        <div className="text-sm opacity-80">{props.category}</div>
        {state.message ? (
          <div className="text-sm mt-1">{state.ok ? '✅ ' : '❌ '}{state.message}</div>
        ) : null}
      </div>

      <input
        name="stock"
        type="number"
        defaultValue={props.stock ?? 0}
        className="rounded bg-black border border-white/20 p-2"
      />

      <input
        name="low_stock_threshold"
        type="number"
        min={0}
        defaultValue={props.low_stock_threshold ?? 2}
        className="rounded bg-black border border-white/20 p-2"
      />

      <input
        name="location"
        defaultValue={props.location ?? ''}
        className="rounded bg-black border border-white/20 p-2 md:col-span-2"
      />

      <input
        name="notes"
        defaultValue={props.notes ?? ''}
        className="rounded bg-black border border-white/20 p-2 md:col-span-2"
      />

      <SubmitButton idleText="Save" pendingText="Saving..." />
    </form>
  )
}
