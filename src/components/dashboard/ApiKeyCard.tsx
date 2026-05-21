'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Key, Copy, Eye, EyeOff, Trash2,
  Calendar, Activity, AlertCircle, CheckCircle
} from 'lucide-react'
import {
  resolveApiKeyPlaintext,
  formatMaskedApiKey,
  type ApiKeyRecord,
} from '@/lib/api/api-keys'

interface ApiKeyCardProps {
  apiKey: ApiKeyRecord
  onDelete: (id: number) => void
  onToggleVisibility: (id: number) => void
  isVisible: boolean
}

export function ApiKeyCard({
  apiKey,
  onDelete,
  onToggleVisibility,
  isVisible,
}: ApiKeyCardProps) {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState('')

  const plaintext = resolveApiKeyPlaintext(apiKey.id, apiKey.key)
  const canCopy = Boolean(plaintext)

  const handleCopy = async () => {
    setCopyError('')
    if (!plaintext) {
      setCopyError('Full key is only shown once when you create it. Create a new key if you lost it.')
      return
    }
    try {
      await navigator.clipboard.writeText(plaintext)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopyError('Could not copy to clipboard. Select the key text and copy manually.')
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never used'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const statusVariant = () => {
    if (!apiKey.is_active) return 'secondary' as const
    if (apiKey.last_used_at) return 'success' as const
    return 'warning' as const
  }

  const statusText = () => {
    if (!apiKey.is_active) return 'Inactive'
    if (apiKey.last_used_at) return 'Active'
    return 'Created'
  }

  const displayValue = isVisible
    ? (plaintext ?? 'Full key unavailable — only shown once at creation')
    : formatMaskedApiKey(plaintext)

  return (
    <div className="dashboard-panel hover:shadow-glass-lg transition-shadow duration-200">
      <div className="dashboard-panel-header">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-brand bg-brand-muted">
            <Key className="h-5 w-5 text-brand-strong" aria-hidden />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-ink truncate">{apiKey.name}</h3>
            <p className="text-xs text-ink-muted">
              Created{' '}
              {apiKey.created_at
                ? new Date(apiKey.created_at).toLocaleDateString()
                : 'recently'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Badge variant={statusVariant()}>{statusText()}</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleVisibility(apiKey.id)}
            className="h-8 w-8 p-0"
            title={isVisible ? 'Hide API key' : 'Show API key'}
            disabled={!canCopy}
          >
            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(apiKey.id)}
            className="h-8 w-8 p-0 text-error-500 hover:text-error-600 hover:bg-red-50"
            title="Delete API key"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="dashboard-panel-body space-y-4">
        <div>
          <label className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2 block">
            Secret key
          </label>
          <div className="flex items-center gap-2">
            <code className="dashboard-code-block">{displayValue}</code>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="shrink-0"
              disabled={!canCopy}
              title={canCopy ? 'Copy full API key' : 'Full key not available'}
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 text-success-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          {copied && (
            <p className="text-xs text-success-600 mt-2 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Copied to clipboard
            </p>
          )}
          {copyError && (
            <p className="text-xs text-amber-700 mt-2 flex items-start gap-1">
              <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
              {copyError}
            </p>
          )}
          {!canCopy && !copyError && (
            <p className="text-xs text-ink-muted mt-2">
              The full key is only returned at creation. Save it then or create a new key.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-brand bg-surface-elevated px-3 py-2.5 flex items-center gap-2">
            <Activity className="h-4 w-4 text-ink-dim shrink-0" />
            <div>
              <p className="text-[11px] text-ink-muted uppercase tracking-wide">Last used</p>
              <p className="text-sm font-medium text-ink">{formatDate(apiKey.last_used_at)}</p>
            </div>
          </div>
          <div className="rounded-brand bg-surface-elevated px-3 py-2.5 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-ink-dim shrink-0" />
            <div>
              <p className="text-[11px] text-ink-muted uppercase tracking-wide">Requests</p>
              <p className="text-sm font-medium text-ink tabular-nums">
                {(apiKey.usage_count || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {isVisible && canCopy && (
          <div className="flex items-start gap-2 rounded-brand border border-amber-200/80 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              <span className="font-medium">Keep this key private.</span> Never commit it to git or
              expose it in client-side code.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
