'use client'

import { useId, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Key, AlertCircle, Copy, CheckCircle, Loader2, ShieldCheck } from 'lucide-react'
import { ApiError } from '@/types/api'
import type { CreatedApiKeyResult } from '@/lib/api/api-keys'
import {
  DASHBOARD_ICON_STROKE,
  DashboardAlert,
  DashboardModal,
  DashboardModalCard,
} from '@/components/dashboard/dashboard-shell'

interface CreateApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string) => Promise<CreatedApiKeyResult | void>
  isLoading?: boolean
  namePlaceholder?: string
  upgradeHref?: string
}

export function CreateApiKeyModal({
  isOpen,
  onClose,
  onCreate,
  isLoading = false,
  namePlaceholder = 'e.g., Mobile App, Web Dashboard, Production',
  upgradeHref = '/dashboard/billing',
}: CreateApiKeyModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [verifyNeeded, setVerifyNeeded] = useState(false)
  const [upgradeNeeded, setUpgradeNeeded] = useState(false)
  const [created, setCreated] = useState<CreatedApiKeyResult | null>(null)
  const [copied, setCopied] = useState(false)
  const formId = useId()
  const titleId = useId()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('API key name is required')
      return
    }

    if (name.length > 100) {
      setError('API key name must be less than 100 characters')
      return
    }

    setVerifyNeeded(false)
    setUpgradeNeeded(false)
    try {
      const result = await onCreate(name.trim())
      if (result?.key) {
        setCreated(result)
        setName('')
        setError('')
      } else {
        handleClose()
      }
    } catch (err) {
      const isVerifyError =
        err instanceof ApiError &&
        err.status === 403 &&
        /verify your email/i.test(err.message)
      const isLimitError =
        err instanceof ApiError &&
        (err.status === 403 || err.status === 400) &&
        (/api key limit/i.test(err.message) || /reached .* plan/i.test(err.message))
      if (isVerifyError) {
        setVerifyNeeded(true)
        setError('Verify your email address before creating API keys.')
      } else if (isLimitError) {
        setUpgradeNeeded(true)
        setError(
          'You have reached the API key limit for your plan. Upgrade your plan to add more keys.'
        )
      } else {
        setError(err instanceof Error ? err.message : 'Failed to create API key')
      }
    }
  }

  const handleCopy = async () => {
    if (!created?.key) return
    try {
      await navigator.clipboard.writeText(created.key)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy to clipboard. Select the key below and copy manually.')
    }
  }

  const handleClose = () => {
    setName('')
    setError('')
    setVerifyNeeded(false)
    setUpgradeNeeded(false)
    setCreated(null)
    setCopied(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <DashboardModal onClose={handleClose} closeOnBackdrop={false} closeOnEscape={!created}>
      <DashboardModalCard
        icon={Key}
        title={created ? 'Save your API key' : 'Create New API Key'}
        labelledBy={titleId}
        onClose={handleClose}
        footer={
          created ? (
            <Button type="button" size="sm" className="h-9" onClick={handleClose}>
              I&apos;ve saved my key
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="h-9"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form={formId}
                size="sm"
                className="h-9 gap-1.5"
                disabled={isLoading || !name.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={DASHBOARD_ICON_STROKE} />
                    Creating...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
                    Create API Key
                  </>
                )}
              </Button>
            </>
          )
        }
      >
        {created ? (
          <div className="space-y-4">
            <DashboardAlert variant="warning" className="block">
              <p className="font-medium">Copy this key now</p>
              <p className="mt-0.5 text-xs">
                You won&apos;t be able to see the full key again after closing this dialog.
              </p>
            </DashboardAlert>

            <div>
              <p className="dashboard-field-label">{created.name}</p>
              <div className="flex items-start gap-2">
                <code className="dashboard-code-block">
                  {created.key}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="h-9 w-9 shrink-0 p-0"
                  title="Copy API key"
                  aria-label="Copy API key"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-dash-positive" strokeWidth={DASHBOARD_ICON_STROKE} />
                  ) : (
                    <Copy className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
                  )}
                </Button>
              </div>
              {copied && (
                <p className="mt-1.5 text-xs text-dash-positive" role="status">Copied to clipboard</p>
              )}
            </div>
          </div>
        ) : (
          <form id={formId} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="key-name" className="dashboard-field-label">
                API Key Name
              </label>
              <Input
                id="key-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError('')
                  setVerifyNeeded(false)
                  setUpgradeNeeded(false)
                }}
                placeholder={namePlaceholder}
                className="w-full"
                maxLength={100}
                disabled={isLoading}
              />
              <p className="dashboard-field-hint">
                Choose a descriptive name to help you identify this key later
              </p>
            </div>

            {error && (
              <DashboardAlert variant="error" className="flex-nowrap items-start gap-x-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                <div>
                  <p>{error}</p>
                  {verifyNeeded && (
                    <Link
                      href="/auth/verify-email"
                      className="mt-1 inline-block font-medium underline"
                    >
                      Verify your email
                    </Link>
                  )}
                  {upgradeNeeded && (
                    <Link
                      href={upgradeHref}
                      className="mt-1 inline-block font-medium underline"
                    >
                      Upgrade your plan
                    </Link>
                  )}
                </div>
              </DashboardAlert>
            )}

            <div className="flex items-start gap-2.5 rounded-xl border border-dash-border bg-dash-hover px-4 py-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-dash-teal-strong" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
              <div className="text-[13px] text-dash-body">
                <p className="mb-1 font-medium text-dash-ink">Important Security Notes:</p>
                <ul className="list-inside list-disc space-y-1 text-xs text-dash-muted">
                  <li>Store your API key securely</li>
                  <li>Don&apos;t share it publicly or commit to version control</li>
                  <li>The full key is shown only once after creation</li>
                </ul>
              </div>
            </div>
          </form>
        )}
      </DashboardModalCard>
    </DashboardModal>
  )
}
