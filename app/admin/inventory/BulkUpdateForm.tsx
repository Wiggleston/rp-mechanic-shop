'use client'

import { useFormState } from 'react-dom'
import SubmitButton from './SubmitButton'
import { bulkUpdateStockAction } from './actions'

export default function BulkUpdateForm() {
  const [state, formAction] = useFormState(bulkUpdateStockAction, { ok: false, message: '' })

  return (
    <section className="max-w-3xl border border-white/10 rounded p-4 space-y-3">
      <div>
        <h2 className="font-semibold">Bulk Update Stock</h2>
        <p className="text-sm opacity-70">
          Paste lines like <span className="font-mono">Engine Block | 10</span> (names must match exactly).
        </p>
      </div>

      {state.message ? (
        <p className="text-sm">{state.ok ? '✅ ' : '❌ '}{state.message}</p>
      ) : null}

      <form action={formAction} className="space-y-3">
        <textarea
          name="bulk"
          rows={10}
          placeholder={`Engine Block | 10\nPistons | 40\nCrankshaft | 8`}
          className="w-full rounded bg-black border border-white/20 p-2 font-mono"
        />

        <div className="flex justify-end">
          <SubmitButton idleText="Apply Bulk Update" pendingText="Applying..." />
        </div>
      </form>
    </section>
  )
}
