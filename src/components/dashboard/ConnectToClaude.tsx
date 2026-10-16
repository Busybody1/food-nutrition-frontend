'use client'

import Link from 'next/link'
import { Terminal } from 'lucide-react'
import { McpConnectPanel } from '@/components/marketing/mcp-connect-panel'
import { mcpOauthConnectEnabled } from '@/lib/mcp/catalog'
import { isApiKeyPlaintext, type ApiKeyRecord } from '@/lib/api/api-keys'
import {
  DashboardPanelBody,
  DashboardPanelHeader,
} from '@/components/dashboard/dashboard-shell'

export function ConnectToClaude({ apiKeys }: { apiKeys: ApiKeyRecord[] }) {
  const plaintext = apiKeys.map((key) => key.key).find((value) => isApiKeyPlaintext(value))

  return (
    <section className="dashboard-panel" aria-labelledby="connect-claude-heading">
      <DashboardPanelHeader
        icon={Terminal}
        title={<span id="connect-claude-heading">Connect to Claude Code or Cursor</span>}
      />
      <DashboardPanelBody>
        <p className="max-w-3xl text-[13px] leading-5 text-dash-muted">
          Paste the API key config into Claude Code or Cursor.{' '}
          {mcpOauthConnectEnabled()
            ? 'Claude.ai, Claude Desktop, and Claude mobile use the Claude tab: server URL only, then the sign-in screen.'
            : 'Browser sign-in for Claude apps stays off until the API enables OAuth.'}{' '}
          <Link href="/docs/mcp" className="font-medium text-dash-teal-strong underline underline-offset-2">
            Setup docs
          </Link>
          .
        </p>
        <div className="mt-4">
          <McpConnectPanel apiKey={plaintext} initialTab="claude-code" />
        </div>
      </DashboardPanelBody>
    </section>
  )
}
