'use client'

import { useCallback, useEffect, useState } from 'react'
import { Bot, Copy } from 'lucide-react'
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
  DashboardLoading,
} from '@/components/admin/admin-ui'
import { adminAPI, AdminMcpToken, AdminMcpTokenCreated } from '@/lib/api/admin'
import {
  adminClaudeCodeCommand,
  adminCursorConfig,
  adminMcpEndpoint,
  adminMcpUiEnabled,
} from '@/lib/admin-mcp/connect'

const EXPIRY_DAYS = [7, 30, 90] as const

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

  return (
    <AdminPage>
      <AdminPageHeader
        title="Claude (MCP)"
        description="Read-only access for Claude Code and Cursor. Ask one of the questions below."
      />

      <AdminPanel>
        <AdminPanelHeader title="Example questions" />
        <AdminPanelBody>
          <ul className="list-disc space-y-1 pl-5 text-sm text-ink">
            {EXAMPLE_QUESTIONS.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        </AdminPanelBody>
      </AdminPanel>

      {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}

      <AdminPanel>
        <AdminPanelHeader title="New token" icon={Bot} />
        <AdminPanelBody>
          <div className="flex flex-col gap-3 max-w-xl">
            <label className="text-sm text-ink" htmlFor="mcp-token-name">
              Name
            </label>
            <Input
              id="mcp-token-name"
              value={name}
              maxLength={80}
              onChange={(event) => setName(event.target.value)}
            />
            <div className="flex gap-2">
              {EXPIRY_DAYS.map((choice) => (
                <Button
                  key={choice}
                  type="button"
                  variant={days === choice ? 'default' : 'outline'}
                  onClick={() => setDays(choice)}
                >
                  {choice} days
                </Button>
              ))}
            </div>
            <Button type="button" onClick={createToken} disabled={saving}>
              {saving ? 'Creating...' : 'Create token'}
            </Button>
          </div>
        </AdminPanelBody>
      </AdminPanel>

      {created ? (
        <AdminPanel>
          <AdminPanelHeader title="Connect" />
          <AdminPanelBody>
            <DashboardAlert variant="warning">
              This is shown once. Anyone with it can read all admin data.
            </DashboardAlert>
            <p className="mt-3 text-sm text-ink-dim">Endpoint</p>
            <pre className="mt-1 overflow-x-auto rounded-md bg-muted p-3 text-xs">{endpoint}</pre>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-sm text-ink-dim">Claude Code</p>
              <Button type="button" variant="outline" size="sm" onClick={() => copyText('command', command)}>
                <Copy className="mr-1.5 h-4 w-4" />
                {copied === 'command' ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <pre className="mt-1 overflow-x-auto rounded-md bg-muted p-3 text-xs">{command}</pre>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-sm text-ink-dim">Cursor</p>
              <Button type="button" variant="outline" size="sm" onClick={() => copyText('cursor', cursor)}>
                <Copy className="mr-1.5 h-4 w-4" />
                {copied === 'cursor' ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <pre className="mt-1 overflow-x-auto rounded-md bg-muted p-3 text-xs">{cursor}</pre>
          </AdminPanelBody>
        </AdminPanel>
      ) : null}

      <AdminPanel>
        <AdminPanelHeader title="Your tokens" />
        <AdminPanelBody>
          {loading ? (
            <DashboardLoading />
          ) : tokens.length === 0 ? (
            <DashboardEmpty
              icon={Bot}
              title="No tokens"
              description="Create one to connect Claude Code or Cursor."
            />
          ) : (
            <AdminTableWrap>
              <AdminTable>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Prefix</th>
                    <th>Expires</th>
                    <th>Last used</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token) => (
                    <tr key={token.id}>
                      <td>{token.name}</td>
                      <td>{token.token_prefix}</td>
                      <td>{formatWhen(token.expires_at)}</td>
                      <td>{formatWhen(token.last_used_at)}</td>
                      <td>
                        {token.revoked_at ? (
                          'Revoked'
                        ) : (
                          <Button type="button" variant="outline" size="sm" onClick={() => revoke(token)}>
                            Revoke
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </AdminTable>
            </AdminTableWrap>
          )}
        </AdminPanelBody>
      </AdminPanel>
    </AdminPage>
  )
}
