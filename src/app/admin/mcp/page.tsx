'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Bot, Check, Copy, KeyRound, MessageSquareText, Plug, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminPanelBody,
  AdminPanelHeader,
  AdminTable,
  AdminTableWrap,
  DashboardAlert,
  DashboardEmpty,
  DashboardIconTile,
  DashboardLoading,
  DashboardPill,
  DashboardSegmented,
  DASHBOARD_ICON_STROKE,
} from '@/components/admin/admin-ui'
import { adminAPI, AdminMcpToken, AdminMcpTokenCreated } from '@/lib/api/admin'
import {
  adminClaudeCodeCommand,
  adminCursorConfig,
  adminMcpEndpoint,
  adminMcpUiEnabled,
} from '@/lib/admin-mcp/connect'

const EXPIRY_DAYS = [7, 30, 90] as const

const EXPIRY_OPTIONS = EXPIRY_DAYS.map((choice) => ({
  value: String(choice),
  label: `${choice} days`,
}))

const EXAMPLE_QUESTIONS = [
  'What was revenue by month this year?',
  'Show open food review issues by class.',
  'How many users signed up this month?',
  'Which endpoints returned the most errors in the last 7 days?',
  'List open support conversations.',
] as const

function formatWhen(value: string | null): string {
  if (!value) return 'Never'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function ConnectSnippet({
  label,
  value,
  action,
}: {
  label: string
  value: string
  action?: ReactNode
}) {
  return (
    <div>
      <div className="flex min-h-8 items-center justify-between gap-3">
        <p className="text-xs font-medium text-dash-body">{label}</p>
        {action}
      </div>
      <pre className="dashboard-code-block mt-1.5 block overflow-x-auto whitespace-pre-wrap">{value}</pre>
    </div>
  )
}

export default function AdminMcpPage() {
  const enabled = adminMcpUiEnabled()
  const [tokens, setTokens] = useState<AdminMcpToken[]>([])
  const [name, setName] = useState('Claude')
  const [days, setDays] = useState<(typeof EXPIRY_DAYS)[number]>(30)
  const [created, setCreated] = useState<AdminMcpTokenCreated | null>(null)
  const [loading, setLoading] = useState(enabled)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')

  const [reloadKey, setReloadKey] = useState(0)

  const reload = useCallback(() => {
    setReloadKey((current) => current + 1)
  }, [])

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    adminAPI
      .listAdminMcpTokens()
      .then((data) => {
        if (cancelled) return
        setTokens(data.tokens)
        setError('')
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load tokens')
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [enabled, reloadKey])

  const copyText = async (label: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(label)
  }

  const createToken = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Name is required')
      return
    }
    setSaving(true)
    setError('')
    try {
      const row = await adminAPI.createAdminMcpToken({ name: trimmed, expiresInDays: days })
      setCreated(row)
      setCopied('')
      reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create token')
    } finally {
      setSaving(false)
    }
  }

  const revoke = async (token: AdminMcpToken) => {
    if (!window.confirm(`Revoke ${token.name}? Claude will lose access with this token.`)) return
    setError('')
    try {
      await adminAPI.revokeAdminMcpToken(token.id)
      if (created?.id === token.id) setCreated(null)
      reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke token')
    }
  }

  if (!enabled) {
    return (
      <AdminPage>
        <AdminPageHeader
          title="Claude (MCP)"
          description="Admin MCP is off. Set NEXT_PUBLIC_ADMIN_MCP_ENABLED to show this page."
        />
      </AdminPage>
    )
  }

  const endpoint = adminMcpEndpoint()
  const command = created ? adminClaudeCodeCommand(endpoint, created.token) : ''
  const cursor = created ? adminCursorConfig(endpoint, created.token) : ''

  const copyButton = (label: string, text: string) => (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 gap-1.5"
      onClick={() => copyText(label, text)}
    >
      {copied === label ? (
        <Check className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
      ) : (
        <Copy className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
      )}
      {copied === label ? 'Copied' : 'Copy'}
    </Button>
  )

  return (
    <AdminPage>
      <AdminPageHeader
        title="Claude (MCP)"
        description="Read-only access for Claude Code and Cursor. Ask one of the questions below."
      />

      {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}

      <div className="dashboard-grid-wide">
        <AdminPanel>
          <AdminPanelHeader title="New token" icon={Bot} />
          <AdminPanelBody>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <div className="min-w-0">
                <label className="dashboard-field-label" htmlFor="mcp-token-name">
                  Name
                </label>
                <Input
                  id="mcp-token-name"
                  value={name}
                  maxLength={80}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div>
                <span className="dashboard-field-label">Expires in</span>
                <DashboardSegmented
                  value={String(days)}
                  options={EXPIRY_OPTIONS}
                  ariaLabel="Expires in"
                  className="h-9"
                  onChange={(value) => {
                    const choice = EXPIRY_DAYS.find((option) => String(option) === value)
                    if (choice) setDays(choice)
                  }}
                />
              </div>
            </div>
          </AdminPanelBody>
          <div className="flex justify-end gap-2 border-t border-dash-border px-5 py-4">
            <Button type="button" size="sm" className="h-9 gap-1.5" onClick={createToken} disabled={saving}>
              <Plus className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
              {saving ? 'Creating...' : 'Create token'}
            </Button>
          </div>
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader title="Example questions" icon={MessageSquareText} />
          <AdminPanelBody>
            <ul className="-my-2.5 divide-y divide-dash-border/70">
              {EXAMPLE_QUESTIONS.map((question) => (
                <li
                  key={question}
                  className="flex items-start gap-2.5 py-2.5 text-[13px] leading-5 text-dash-body"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-dash-teal" aria-hidden />
                  {question}
                </li>
              ))}
            </ul>
          </AdminPanelBody>
        </AdminPanel>
      </div>

      {created ? (
        <AdminPanel>
          <AdminPanelHeader title="Connect" icon={Plug} />
          <AdminPanelBody className="space-y-4">
            <DashboardAlert variant="warning">
              This is shown once. Anyone with it can read all admin data.
            </DashboardAlert>
            <ConnectSnippet label="Endpoint" value={endpoint} />
            <ConnectSnippet
              label="Claude Code"
              value={command}
              action={copyButton('command', command)}
            />
            <ConnectSnippet label="Cursor" value={cursor} action={copyButton('cursor', cursor)} />
          </AdminPanelBody>
        </AdminPanel>
      ) : null}

      <AdminPanel>
        <AdminPanelHeader
          title="Your tokens"
          icon={KeyRound}
          description={
            loading ? undefined : `${tokens.length} ${tokens.length === 1 ? 'token' : 'tokens'}`
          }
        />
        {loading ? (
          <AdminPanelBody>
            <DashboardLoading />
          </AdminPanelBody>
        ) : tokens.length === 0 ? (
          <AdminPanelBody>
            <DashboardEmpty
              icon={Bot}
              title="No tokens"
              description="Create one to connect Claude Code or Cursor."
            />
          </AdminPanelBody>
        ) : (
          <AdminPanelBody noPadding>
            <AdminTableWrap>
              <AdminTable>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Prefix</th>
                    <th>Expires</th>
                    <th>Last used</th>
                    <th className="dashboard-num">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token) => (
                    <tr key={token.id}>
                      <td>
                        <div className="flex min-w-0 items-center gap-3">
                          <DashboardIconTile icon={Bot} tone="brand" className="h-8 w-8" />
                          <span className="truncate font-medium text-dash-ink">{token.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="rounded-md bg-dash-pill px-1.5 py-0.5 font-mono text-xs text-dash-body">
                          {token.token_prefix}
                        </span>
                      </td>
                      <td className="whitespace-nowrap text-dash-muted">{formatWhen(token.expires_at)}</td>
                      <td className="whitespace-nowrap text-dash-muted">{formatWhen(token.last_used_at)}</td>
                      <td className="dashboard-num">
                        {token.revoked_at ? (
                          <DashboardPill tone="neutral">Revoked</DashboardPill>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 text-dash-negative hover:bg-dash-negative-soft hover:text-dash-negative"
                            onClick={() => revoke(token)}
                          >
                            Revoke
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </AdminTable>
            </AdminTableWrap>
          </AdminPanelBody>
        )}
      </AdminPanel>
    </AdminPage>
  )
}
