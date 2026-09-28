import assert from 'node:assert/strict'
import test from 'node:test'
import {
  MCP_PAGE_FAQS,
  MCP_TOOLS,
  annualSavingsUsd,
  claudeCodeCommand,
  cursorConfig,
  mcpTrialClick,
  safeNextPath,
  isSafeOAuthRedirect,
} from './catalog.ts'

test('annual savings is the gap versus twelve monthly payments', () => {
  assert.equal(annualSavingsUsd(29, 228), 120)
  assert.equal(annualSavingsUsd(29, 400), 0)
  assert.equal(annualSavingsUsd(Number.NaN, 228), 0)
})

test('the landing FAQ explains the service and the plan limits', () => {
  assert.ok(MCP_PAGE_FAQS.length >= 8 && MCP_PAGE_FAQS.length <= 10)
  const questions = MCP_PAGE_FAQS.map((item) => item.q).join(' ')
  const answers = MCP_PAGE_FAQS.map((item) => item.a).join(' ')
  assert.match(questions, /What is this MCP service/)
  assert.match(answers, /403/)
  assert.match(answers, /personal use/i)
  assert.equal(answers.includes('fn_'), false)
})

test('connect snippets use a placeholder key', () => {
  const command = claudeCodeCommand('https://calorieapiadmin.com/mcp')
  const config = cursorConfig('https://calorieapiadmin.com/mcp')
  assert.match(command, /X-API-Key: YOUR_KEY/)
  assert.match(config, /YOUR_KEY/)
  assert.equal(config.includes('fn_'), false)
  assert.equal(MCP_TOOLS.length, 8)
})

test('login next paths stay on this site', () => {
  assert.equal(safeNextPath('/mcp/pricing'), '/mcp/pricing')
  assert.equal(safeNextPath('/dashboard/api-keys?mcp=connected'), '/dashboard/api-keys?mcp=connected')
  assert.equal(safeNextPath('https://evil.example/mcp'), null)
  assert.equal(safeNextPath('//evil.example/mcp'), null)
  assert.equal(safeNextPath('/oauth/consent?request=abc'), '/oauth/consent?request=abc')
  assert.equal(safeNextPath('/oauth/authorize'), null)
  assert.equal(safeNextPath('/pricing'), null)
})

test('oauth return urls stay on the client host', () => {
  assert.equal(isSafeOAuthRedirect('https://claude.ai/api/mcp/auth_callback?code=1', 'claude.ai'), true)
  assert.equal(isSafeOAuthRedirect('http://127.0.0.1:53123/callback?code=1', '127.0.0.1'), true)
  assert.equal(isSafeOAuthRedirect('http://127.0.0.1:53123/callback?code=1', 'claude.ai'), false)
  assert.equal(isSafeOAuthRedirect('http://localhost:53123/callback?code=1', 'claude.ai'), false)
  assert.equal(isSafeOAuthRedirect('https://evil.example/callback', 'claude.ai'), false)
  assert.equal(isSafeOAuthRedirect('javascript:alert(1)', 'claude.ai'), false)
})

test('trial click signs out users in and only checks out an open plan', () => {
  assert.equal(
    mcpTrialClick({ loading: true, isAuthenticated: false, hasSession: false, checkoutOpen: false }),
    'login'
  )
  assert.equal(
    mcpTrialClick({ loading: true, isAuthenticated: false, hasSession: true, checkoutOpen: true }),
    'wait'
  )
  assert.equal(
    mcpTrialClick({ loading: false, isAuthenticated: true, hasSession: true, checkoutOpen: false }),
    'closed'
  )
  assert.equal(
    mcpTrialClick({ loading: false, isAuthenticated: true, hasSession: true, checkoutOpen: true }),
    'checkout'
  )
})
