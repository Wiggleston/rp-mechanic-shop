'use client'

import { useFormState } from 'react-dom'
import SubmitButton from './SubmitButton'
import { addItemAction } from './actions'

export default function AddItemForm() {
  const [state, formAction] = useFormState(addItemAction, { ok: false, message: '' })

  return (
    <section className="max-w-3xl border border-white/10 rounded p-4">
      <h2 className="font-semibold mb-3">Add Item</h2>

      {state.message ? <p className="mb-2 text-sm">{state.ok ? '✅ ' : '❌ '}{state.message}</p> : null}

      <form action={formAction} className="grid gap-2 md:grid-cols-5">
        <input name="name" placeholder="Item Name" className="rounded bg-black border border-white/20 p-2 md:col-span-2" />
        <input name="category" placeholder="Category" className="rounded bg-black border border-white/20 p-2" />
        <input name="stock" type="number" placeholder="Stock" defaultValue={0} className="rounded bg-black border border-white/20 p-2" />
        <input name="location" placeholder="Location" className="rounded bg-black border border-white/20 p-2" />
        <input name="notes" placeholder="Notes" className="rounded bg-black border border-white/20 p-2 md:col-span-5" />

        <div className="md:col-span-2">
          <SubmitButton idleText="Add" pendingText="Adding..." />
        </div>
      </form>
    </section>
  )
}
