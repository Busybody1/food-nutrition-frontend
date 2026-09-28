'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { CapabilityCodeWindow } from '@/components/marketing/capability-code-window'
import {
  claudeCodeCommand,
  claudeOAuthSteps,
  cursorConfig,
  genericHeaderConfig,
  mcpEndpoint,
  mcpOauthConnectEnabled,
} from '@/lib/mcp/catalog'

type TabId = 'claude' | 'claude-code' | 'cursor' | 'other'

const TABS: { id: TabId; label: string }[] = [
  { id: 'claude', label: 'Claude' },
  { id: 'claude-code', label: 'Claude Code' },
  { id: 'cursor', label: 'Cursor' },
  { id: 'other', label: 'Other' },
]

function snippetFor(tab: TabId, apiKey?: string): { title: string; code: string } {
  const key = apiKey && apiKey.length > 0 ? apiKey : 'YOUR_KEY'
  if (tab === 'claude') {
    return { title: 'Claude.ai, Desktop, and mobile', code: claudeOAuthSteps(mcpEndpoint()) }
  }
  if (tab === 'claude-code') {
    return {
      title: 'Terminal',
      code: claudeCodeCommand(mcpEndpoint()).split('YOUR_KEY').join(key),
    }
  }
  if (tab === 'cursor') {
    return { title: '.cursor/mcp.json', code: cursorConfig(mcpEndpoint(), key) }
  }
  return {
    title: 'Any header-capable client',
    code: genericHeaderConfig().split('YOUR_KEY').join(key),
  }
}

export function McpConnectPanel({
  apiKey,
  initialTab = 'claude',
}: {
  apiKey?: string
  initialTab?: TabId
}) {
  const [tab, setTab] = useState<TabId>(initialTab)
  const [copied, setCopied] = useState(false)
  const snippet = snippetFor(tab, apiKey)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div>
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-brand border border-surface-border bg-white p-1" role="tablist" aria-label="MCP clients">
        {TABS.map((item) => {
          const selected = tab === item.id
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={
                selected
                  ? 'h-10 shrink-0 rounded-brand bg-brand px-4 text-sm font-medium text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50'
                  : 'h-10 shrink-0 rounded-brand px-4 text-sm font-medium text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50'
              }
              onClick={() => {
                setTab(item.id)
                setCopied(false)
              }}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      <CapabilityCodeWindow title={snippet.title} code={snippet.code} />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" className="btn-brand h-10 px-4" onClick={() => void copy()}>
          {copied ? <Check className="mr-2 h-4 w-4" aria-hidden /> : <Copy className="mr-2 h-4 w-4" aria-hidden />}
          {copied ? 'Copied' : 'Copy config'}
        </button>
        <p className="text-sm text-ink-muted">
          {tab === 'claude'
            ? mcpOauthConnectEnabled()
              ? 'These apps sign in through the browser. The API key stays in Claude Code and Cursor.'
              : 'Browser sign-in is off on this server until the API enables OAuth. Use Claude Code or Cursor with an API key.'
            : apiKey
              ? 'This config includes the key you just created. Treat it like a password.'
              : 'Replace YOUR_KEY with a key from the dashboard. It is shown in full only when you create it.'}
        </p>
      </div>
    </div>
  )
}
