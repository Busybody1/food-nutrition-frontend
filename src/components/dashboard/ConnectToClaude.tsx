'use client'

import Link from 'next/link'
import { McpConnectPanel } from '@/components/marketing/mcp-connect-panel'
import { mcpOauthConnectEnabled } from '@/lib/mcp/catalog'
import { isApiKeyPlaintext, type ApiKeyRecord } from '@/lib/api/api-keys'

export function ConnectToClaude({ apiKeys }: { apiKeys: ApiKeyRecord[] }) {
  const plaintext = apiKeys.map((key) => key.key).find((value) => isApiKeyPlaintext(value))

  return (
    <section className="marketing-card p-5 md:p-6" aria-labelledby="connect-claude-heading">
      <h2 id="connect-claude-heading" className="text-lg font-semibold text-ink">
        Connect to Claude Code or Cursor
      </h2>
      <p className="mt-2 text-sm text-ink-muted leading-relaxed">
        Paste the API key config into Claude Code or Cursor.{' '}
        {mcpOauthConnectEnabled()
          ? 'Claude.ai, Claude Desktop, and Claude mobile use the Claude tab: server URL only, then the sign-in screen.'
          : 'Browser sign-in for Claude apps stays off until the API enables OAuth.'}{' '}
        <Link href="/docs/mcp" className="text-brand-strong underline">
          Setup docs
        </Link>
        .
      </p>
      <div className="mt-4">
        <McpConnectPanel apiKey={plaintext} initialTab="claude-code" />
      </div>
    </section>
  )
}
