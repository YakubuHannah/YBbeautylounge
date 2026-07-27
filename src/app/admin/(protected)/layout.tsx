import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth/admin-session'
import { AdminShell } from '../_components/admin-shell'

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  return <AdminShell email={session.email}>{children}</AdminShell>
}
