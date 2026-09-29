import assert from 'node:assert/strict'
import test from 'node:test'
import { buildRobotsTxt } from './robots-txt.ts'

test('citation crawlers are allowed and private paths stay closed', () => {
  const body = buildRobotsTxt('https://calorieapi.com')
  for (const bot of ['OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'Bingbot']) {
    assert.match(body, new RegExp(`User-agent: ${bot}`))
  }
  assert.match(body, /ai-input=yes, ai-train=no/)
  assert.match(body, /Disallow: \/dashboard\//)
  assert.match(body, /Sitemap: https:\/\/calorieapi.com\/sitemap.xml/)
  assert.equal(body.includes('Disallow: /mcp'), false)
})
