export function adminMcpUiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ADMIN_MCP_ENABLED === 'true'
}

export function adminMcpEndpoint(): string {
  const base = (process.env.NEXT_PUBLIC_API_URL || 'https://calorieapiadmin.com').replace(/\/$/, '')
  return `${base}/admin-mcp/`
}

export function adminClaudeCodeCommand(url: string, token: string): string {
  return `claude mcp add --transport http calorie-admin ${url} --header "Authorization: Bearer ${token}"`
}

export function adminCursorConfig(url: string, token: string): string {
  return JSON.stringify(
    {
      mcpServers: {
        'calorie-admin': {
          url,
          headers: { Authorization: `Bearer ${token}` },
        },
      },
    },
    null,
    2
  )
}
