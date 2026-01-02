import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/requireRole'

export default async function AdminIndexPage() {
  // Allow managers + admins to access admin area
  await requireRole(['manager', 'admin'])

  // Default admin landing page
  redirect('/admin/inventory')
}
