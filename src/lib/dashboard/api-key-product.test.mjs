import assert from 'node:assert/strict'
import test from 'node:test'
import { accountIsMcp, apiKeyProductFromSearch, keysForProduct } from './api-key-product.ts'

test('mcp plans are recognized by tier or name', () => {
  assert.equal(accountIsMcp({ plan_tier: 'mcp', name: 'BusyBody MCP' }), true)
  assert.equal(accountIsMcp({ name: 'BusyBody MCP' }), true)
  assert.equal(accountIsMcp({ plan_name: 'BusyBody MCP', plan_tier: '' }), true)
  assert.equal(accountIsMcp({ plan_tier: 'basic', name: 'Plus' }), false)
  assert.equal(accountIsMcp(null), false)
})

test('keys are listed on the product stamped on the key', () => {
  const keys = [
    { id: 1, product: 'mcp' },
    { id: 2, product: 'rest' },
    { id: 3 },
  ]
  assert.deepEqual(keysForProduct(keys, 'mcp', 'rest').map((key) => key.id), [1])
  assert.deepEqual(keysForProduct(keys, 'rest', 'rest').map((key) => key.id), [2, 3])
  assert.deepEqual(keysForProduct(keys, 'mcp', 'mcp').map((key) => key.id), [1, 3])
})

test('the key page opens the product in the URL, then the account plan', () => {
  assert.equal(apiKeyProductFromSearch('product=rest', true), 'rest')
  assert.equal(apiKeyProductFromSearch('?product=mcp', false), 'mcp')
  assert.equal(apiKeyProductFromSearch('mcp=connected', false), 'mcp')
  assert.equal(apiKeyProductFromSearch('', true), 'mcp')
  assert.equal(apiKeyProductFromSearch('', false), 'rest')
})
