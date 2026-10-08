import assert from 'node:assert/strict'
import test from 'node:test'
import {
  adminClaudeCodeCommand,
  adminCursorConfig,
  adminMcpEndpoint,
  adminMcpUiEnabled,
} from './connect.ts'

test('the admin MCP URL ends with /admin-mcp/ once', () => {
  const previous = process.env.NEXT_PUBLIC_API_URL
  process.env.NEXT_PUBLIC_API_URL = 'https://calorieapiadmin.com/'
  const url = adminMcpEndpoint()
  assert.equal(url, 'https://calorieapiadmin.com/admin-mcp/')
  assert.equal(url.split('/admin-mcp/').length - 1, 1)
  if (previous === undefined) delete process.env.NEXT_PUBLIC_API_URL
  else process.env.NEXT_PUBLIC_API_URL = previous
})

test('the token appears only in the Authorization header', () => {
  const token = 'bbadm_exampletokenvalue'
  const url = 'https://calorieapiadmin.com/admin-mcp/'
  const command = adminClaudeCodeCommand(url, token)
  const config = adminCursorConfig(url, token)
  assert.equal(command.indexOf(token), command.lastIndexOf(token))
  assert.match(command, new RegExp(`Authorization: Bearer ${token}`))
  const parsed = JSON.parse(config)
  assert.equal(parsed.mcpServers['calorie-admin'].url, url)
  assert.equal(parsed.mcpServers['calorie-admin'].headers.Authorization, `Bearer ${token}`)
  const withoutHeader = config.replace(`Bearer ${token}`, '')
  assert.equal(withoutHeader.includes(token), false)
})

test('the nav stays hidden until the frontend flag is true', () => {
  const previous = process.env.NEXT_PUBLIC_ADMIN_MCP_ENABLED
  delete process.env.NEXT_PUBLIC_ADMIN_MCP_ENABLED
  assert.equal(adminMcpUiEnabled(), false)
  process.env.NEXT_PUBLIC_ADMIN_MCP_ENABLED = 'false'
  assert.equal(adminMcpUiEnabled(), false)
  process.env.NEXT_PUBLIC_ADMIN_MCP_ENABLED = 'true'
  assert.equal(adminMcpUiEnabled(), true)
  if (previous === undefined) delete process.env.NEXT_PUBLIC_ADMIN_MCP_ENABLED
  else process.env.NEXT_PUBLIC_ADMIN_MCP_ENABLED = previous
})
