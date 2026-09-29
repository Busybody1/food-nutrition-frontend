import type { DocsSectionContent } from '@/lib/docs/types'

export const RATE_LIMITS_CONTENT: DocsSectionContent = {
  blocks: [
    {
      kind: 'p',
      text: 'API rate limits apply per account, not per IP. The free plan is 10 requests a minute. Plus is 5,000 requests a minute. Monthly quotas are on the pricing page.',
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
        'Commercial use requires Plus or Enterprise. Send X-API-Usage-Type: commercial only when your app is a commercial product.',
        'Plus and Enterprise GET search/food responses may be cached for 5 minutes per account (Redis).',
      ],
    },
    { kind: 'h2', text: 'Limit-related status codes', id: 'status-codes' },
    {
      kind: 'params',
      title: 'Status codes',
      rows: [
        { name: '429', description: 'Per-minute rate limit exceeded. Back off and retry after X-RateLimit-Reset.' },
        { name: '402', description: 'Monthly quota exceeded. Upgrade your plan or wait for the billing cycle reset.' },
        { name: '403', description: 'Commercial use not allowed on your plan, the endpoint is not enabled for your plan, or a food-coverage limit was reached.' },
        { name: '423', description: 'Account temporarily on a security hold due to unusual activity (distinct from a ban; self-heals on expiry). Not retryable; contact support to restore access.' },
      ],
    },
  ],
  faqs: [
    {
      q: 'Do rate limits apply per API key or per account?',
      a: 'Per account (user id). Creating multiple keys under one account does not increase your limits.',
    },
    {
      q: 'How do I raise my limits?',
      a: 'Upgrade your plan from the dashboard, rate limit and quota changes take effect immediately. Enterprise plans negotiate custom limits.',
    },
  ],
}
