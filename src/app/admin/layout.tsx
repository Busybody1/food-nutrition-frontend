'use client'

import { useRouter } from 'next/navigation'
import { Shield } from 'lucide-react'
import { useAdmin } from '@/lib/hooks/use-admin'
import { AdminShell } from '@/components/admin/admin-shell'
import { Button } from '@/components/ui/button'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAdmin()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="dashboard-app flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="dashboard-spinner mx-auto mb-4" role="status" aria-label="Loading" />
          <p className="text-sm font-medium text-dash-ink">Verifying admin access</p>
          <p className="text-xs text-dash-muted mt-1">Checking your permissions…</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="dashboard-app flex items-center justify-center p-6">
        <div className="dashboard-card max-w-md p-8 text-center">
          <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-dash-border bg-dash-hover">
            <Shield className="h-5 w-5 text-dash-muted" strokeWidth={1.75} aria-hidden />
          </span>
          <h1 className="mb-2 text-lg font-semibold text-dash-ink">Access denied</h1>
          <p className="mb-6 text-[13px] text-dash-muted">
            This area is for platform administrators only.
          </p>
          <Button onClick={() => router.push('/dashboard')} className="w-full sm:w-auto">
            Go to developer dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <AdminShell
      userEmail={user?.email}
      userFirstName={user?.first_name}
      userLastName={user?.last_name}
    >
      {children}
    </AdminShell>
  )
}
