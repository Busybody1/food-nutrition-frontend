import type { DocsSectionContent } from '@/lib/docs/types'

export const RATE_LIMITS_CONTENT: DocsSectionContent = {
  blocks: [
    {
      kind: 'p',
      text: 'Limits apply per account (user id), not per IP — safe behind NAT and multi-tenant apps. Each plan combines a per-minute rate limit with a monthly request quota; see the pricing page for current quotas.',
    },
    {
      kind: 'params',
      title: 'Per-minute rate limits by plan',
      rows: [
        { name: 'Free', description: '10 requests/min' },
        { name: 'Basic', description: '200 requests/min' },
        { name: 'Core', description: '500 requests/min' },
        { name: 'Plus', description: '5,000 requests/min · response caching' },
        { name: 'Enterprise', description: 'Custom (negotiated)' },
      ],
    },
    { kind: 'h2', text: 'Rate-limit headers', id: 'headers' },
    {
      kind: 'p',
      text: 'Rate-limited (429) responses include headers you can use for client-side backoff.',
    },
    {
      kind: 'params',
      title: 'Response headers',
      rows: [
        { name: 'X-RateLimit-Limit', description: 'Your plan’s per-minute request limit' },
        { name: 'X-RateLimit-Remaining', description: 'Requests remaining in the current window' },
        { name: 'X-RateLimit-Reset', description: 'When the current window resets' },
      ],
    },
    { kind: 'h2', text: 'Abuse protection & commercial use', id: 'protection' },
    {
      kind: 'list',
      items: [
        '5% food coverage cap: each plan may access at most 5% of distinct foods in the database per calendar month (anti-scrape).',
        'Commercial use requires Plus or Enterprise. Send X-API-Usage-Type: commercial only when your app is a commercial product.',
        'Plus and Enterprise GET search/food responses may be cached for 5 minutes per account (Redis).',
      ],
    },
    { kind: 'h2', text: 'Limit-related status codes', id: 'status-codes' },
    {
      kind: 'params',
      title: 'Status codes',
      rows: [
        { name: '429', description: 'Per-minute rate limit exceeded — back off and retry after X-RateLimit-Reset.' },
        { name: '402', description: 'Monthly quota exceeded — upgrade your plan or wait for the billing cycle reset.' },
        { name: '403', description: 'Commercial use not allowed on your plan, or food coverage cap reached.' },
      ],
    },
  ],
  faqs: [
    {
      q: 'Do rate limits apply per API key or per account?',
      a: 'Per account (user id). Creating multiple keys under one account does not increase your limits.',
    },
    {
      q: 'What is the 5% food coverage cap?',
      a: 'An anti-scraping protection: within a calendar month, one plan can access at most 5% of the distinct foods in the database. Normal app usage never gets close to it; bulk exports do.',
    },
    {
      q: 'How do I raise my limits?',
      a: 'Upgrade your plan from the dashboard — rate limit and quota changes take effect immediately. Enterprise plans negotiate custom limits.',
    },
  ],
}
