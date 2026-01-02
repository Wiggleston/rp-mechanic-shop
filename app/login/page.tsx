import { Suspense } from 'react'
import LoginClient from './LoginClient'

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-[70vh] p-6 flex items-center justify-center">Loading…</main>}>
      <LoginClient />
    </Suspense>
  )
}
