'use client'

import { useFormStatus } from 'react-dom'

export default function SubmitButton({ idle, pending }: { idle: string; pending: string }) {
  const { pending: isPending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={isPending}
      className="rounded bg-white text-black font-semibold p-2 disabled:opacity-50"
    >
      {isPending ? pending : idle}
    </button>
  )
}
