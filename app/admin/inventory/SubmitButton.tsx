'use client'

import { useFormStatus } from 'react-dom'

export default function SubmitButton({ idleText, pendingText }: { idleText: string; pendingText: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      className="rounded bg-white text-black font-semibold p-2 disabled:opacity-50"
      type="submit"
      disabled={pending}
    >
      {pending ? pendingText : idleText}
    </button>
  )
}
