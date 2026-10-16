'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Key, Copy, Eye, EyeOff, Trash2, AlertCircle, CheckCircle } from 'lucide-react'
import {
  resolveApiKeyPlaintext,
  formatMaskedApiKey,
  type ApiKeyRecord,
} from '@/lib/api/api-keys'
import {
  DASHBOARD_ICON_STROKE,
  DashboardIconTile,
  DashboardPill,
} from './dashboard-shell'
import { cn } from '@/lib/utils/cn'

interface ApiKeyRowProps {
  apiKey: ApiKeyRecord
  onDelete: (id: number) => void
  onToggleVisibility: (id: number) => void
  isVisible: boolean
}

export function ApiKeyRow({
  apiKey,
  onDelete,
  onToggleVisibility,
  isVisible,
}: ApiKeyRowProps) {
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

  const statusTone = () => {
    if (!apiKey.is_active) return 'neutral' as const
    if (apiKey.last_used_at) return 'green' as const
    return 'orange' as const
  }

  const statusText = () => {
    if (!apiKey.is_active) return 'Inactive'
    if (apiKey.last_used_at) return 'Active'
    return 'Created'
  }

  const displayValue = isVisible
    ? (plaintext ?? 'Full key unavailable, only shown once at creation')
    : formatMaskedApiKey(plaintext)

  return (
    <tr>
      <td>
        <div className="flex min-w-0 items-center gap-3">
          <DashboardIconTile icon={Key} tone="brand" className="h-8 w-8" />
          <div className="flex min-w-0 items-center gap-2">
            <span className="max-w-[220px] truncate font-medium text-dash-ink" title={apiKey.name}>
              {apiKey.name}
            </span>
            {apiKey.product === 'mcp' || apiKey.product === 'rest' ? (
              <DashboardPill tone="outline">{apiKey.product === 'mcp' ? 'MCP' : 'REST'}</DashboardPill>
            ) : null}
          </div>
        </div>
      </td>
      <td>
        <div className="flex items-center gap-1">
          {canCopy ? (
            <code className="inline-block max-w-[240px] break-all rounded-md border border-dash-border bg-dash-hover px-2 py-1 font-mono text-xs leading-4 text-dash-ink">
              {displayValue}
            </code>
          ) : (
            <span className="block max-w-[220px] text-xs leading-4 text-dash-dim">{displayValue}</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleVisibility(apiKey.id)}
            className="h-8 w-8 shrink-0 p-0 text-dash-muted hover:bg-dash-hover hover:text-dash-ink"
            title={isVisible ? 'Hide API key' : 'Show API key'}
            aria-label={isVisible ? 'Hide API key' : 'Show API key'}
            disabled={!canCopy}
          >
            {isVisible ? (
              <EyeOff className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
            ) : (
              <Eye className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 w-8 shrink-0 p-0 text-dash-muted hover:bg-dash-hover hover:text-dash-ink"
            disabled={!canCopy}
            title={canCopy ? 'Copy full API key' : 'Full key not available'}
            aria-label={canCopy ? 'Copy full API key' : 'Full key not available'}
          >
            {copied ? (
              <CheckCircle className="h-4 w-4 text-dash-positive" strokeWidth={DASHBOARD_ICON_STROKE} />
            ) : (
              <Copy className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
            )}
          </Button>
        </div>
        {copied && (
          <p className="mt-1 flex items-center gap-1 text-xs text-dash-positive" role="status">
            <CheckCircle className="h-3 w-3" aria-hidden />
            Copied to clipboard
          </p>
        )}
        {copyError && (
          <p className="mt-1 flex max-w-[320px] items-start gap-1 text-xs text-dash-warning" role="alert">
            <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
            {copyError}
          </p>
        )}
      </td>
      <td>
        <DashboardPill tone={statusTone()}>{statusText()}</DashboardPill>
      </td>
      <td className={cn('whitespace-nowrap', !apiKey.last_used_at && 'text-dash-dim')}>
        {formatDate(apiKey.last_used_at)}
      </td>
      <td className="dashboard-num font-medium text-dash-ink">
        {(apiKey.usage_count || 0).toLocaleString()}
      </td>
      <td className="whitespace-nowrap">
        {apiKey.created_at ? new Date(apiKey.created_at).toLocaleDateString() : 'recently'}
      </td>
      <td className="text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(apiKey.id)}
          className="h-8 w-8 p-0 text-dash-negative hover:bg-dash-negative-soft hover:text-dash-negative"
          title="Delete API key"
          aria-label="Delete API key"
        >
          <Trash2 className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
        </Button>
      </td>
    </tr>
  )
}
