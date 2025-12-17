'use client'

import { useFormState } from 'react-dom'
import SubmitButton from './SubmitButton'
import { bulkUpdateStockAction } from './actions'

export default function BulkUpdateForm() {
  const [state, formAction] = useFormState(bulkUpdateStockAction, { ok: false, message: '' })

    function downloadTemplate() {
        const text =
        `# Bulk Update Template
        # One item per line: Item Name | Number
        # Names must match exactly

        Engine Block | 10
        Pistons | 40
        Crankshaft | 8
        `

        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = url
        a.download = 'bulk-update-template.txt'
        document.body.appendChild(a)
        a.click()
        a.remove()

        URL.revokeObjectURL(url)
    }


  return (
    <section className="max-w-3xl border border-white/10 rounded p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
            <h2 className="font-semibold">Bulk Update Stock</h2>
            <p className="text-sm opacity-70">
            Paste lines like <span className="font-mono">Engine Block | 10</span> (names must match exactly).
            </p>
        </div>

        <button
            type="button"
            onClick={downloadTemplate}
            className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
        >
            Download Template
        </button>
        </div>


      {state.message ? (
        <p className="text-sm">{state.ok ? '✅ ' : '❌ '}{state.message}</p>
      ) : null}

      <form action={formAction} className="space-y-3">
        <textarea
          name="bulk"
          rows={8}
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
