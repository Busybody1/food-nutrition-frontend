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
      <div className="min-h-screen bg-surface-elevated flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="dashboard-spinner mx-auto mb-4" role="status" aria-label="Loading" />
          <p className="text-sm font-medium text-ink">Verifying admin access</p>
          <p className="text-xs text-ink-muted mt-1">Checking your permissions…</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-surface-elevated flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center bg-white border border-surface-border/80 rounded-brand p-8 shadow-glass">
          <Shield className="w-12 h-12 text-ink-dim mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-ink mb-2">Access denied</h1>
          <p className="text-sm text-ink-muted mb-6">
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
