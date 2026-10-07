import assert from 'node:assert/strict'
import test from 'node:test'
import { accountIsMcp, apiKeyProductFromSearch } from './api-key-product.ts'

test('mcp plans are recognized by tier or name', () => {
  assert.equal(accountIsMcp({ plan_tier: 'mcp', name: 'BusyBody MCP' }), true)
  assert.equal(accountIsMcp({ name: 'BusyBody MCP' }), true)
  assert.equal(accountIsMcp({ plan_tier: 'basic', name: 'Plus' }), false)
  assert.equal(accountIsMcp(null), false)
})

test('the key page opens the product in the URL, then the account plan', () => {
  assert.equal(apiKeyProductFromSearch('product=rest', true), 'rest')
  assert.equal(apiKeyProductFromSearch('?product=mcp', false), 'mcp')
  assert.equal(apiKeyProductFromSearch('mcp=connected', false), 'mcp')
  assert.equal(apiKeyProductFromSearch('', true), 'mcp')
  assert.equal(apiKeyProductFromSearch('', false), 'rest')
})
