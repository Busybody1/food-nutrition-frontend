'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/hooks/use-auth'
import {
  DASHBOARD_ICON_STROKE,
  DashboardPage,
  DashboardPageHeader,
  DashboardPanel,
  DashboardPanelHeader,
  DashboardLoading,
  DashboardAlert,
} from '@/components/dashboard/dashboard-shell'
import { Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react'

export default function AccountPage() {
  const { isAuthenticated, loading, changePassword } = useAuth()
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }
    if (newPassword === currentPassword) {
      setError('New password must be different from the current password.')
      return
    }
    setIsSaving(true)
    try {
      const result = await changePassword(currentPassword, newPassword)
      if (result.success) {
        setSuccess('Password changed.')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setError(result.error || 'Password change failed')
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAuthenticated && loading) {
    return <DashboardLoading message="Loading account…" />
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Account"
        description="Update the password you use to sign in to the dashboard."
      />
      <DashboardPanel className="max-w-xl">
        <DashboardPanelHeader title="Change password" icon={KeyRound} />
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-5 pb-5 pt-3">
            {error && <DashboardAlert variant="error">{error}</DashboardAlert>}
            {success && <DashboardAlert variant="success">{success}</DashboardAlert>}
            <div>
              <label htmlFor="currentPassword" className="dashboard-field-label">
                Current password
              </label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center rounded-r-[10px] pr-3 text-dash-dim transition-colors duration-150 hover:text-dash-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
                  ) : (
                    <Eye className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="newPassword" className="dashboard-field-label">
                New password
              </label>
              <Input
                id="newPassword"
                name="newPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="dashboard-field-label">
                Confirm new password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-dash-border px-5 py-4">
            <Button type="submit" size="sm" disabled={isSaving} className="h-9 gap-1.5">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                'Update password'
              )}
            </Button>
          </div>
        </form>
      </DashboardPanel>
    </DashboardPage>
  )
}
