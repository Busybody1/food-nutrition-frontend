import type { DocsSectionContent } from '@/lib/docs/types'

export const RATE_LIMITS_CONTENT: DocsSectionContent = {
  blocks: [
    {
      kind: 'p',
      text: 'API rate limits apply per account, not per IP. The free plan is 10 requests a minute. Plus is 200 requests a minute. Monthly quotas are on the pricing page. These caps match the public plans API as of 26 November 2026.',
    },
    {
      kind: 'params',
      title: 'Per-minute rate limits by plan',
      rows: [
        { name: 'Free', description: '10 requests/min' },
        { name: 'Basic', description: '30 requests/min' },
        { name: 'Core', description: '50 requests/min' },
        { name: 'Plus', description: '200 requests/min, with response caching' },
        { name: 'Enterprise', description: '500 requests/min per account, plus 60 requests/min for each end user (see below).' },
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
    { kind: 'h2', text: 'Paging limit', id: 'paging-limit' },
    {
      kind: 'p',
      text: 'Food lists return at most the first 1,000 results of a query. On /search/foods, /search/advanced, /catalog/foods and /foods, a call where skip plus limit goes past 1,000 returns 400 with code paging_limit. Narrow the query instead of paging further.',
    },
    { kind: 'h2', text: 'Enterprise: end-user IDs', id: 'end-user-ids' },
    {
      kind: 'p',
      text: 'Enterprise is priced by monthly users, so Enterprise apps send the anonymous ID of the person behind each call in the X-End-User-Id header. A user counts toward the month once they make one successful call. We keep only a scrambled (keyed hash) version of the ID.',
    },
    {
      kind: 'list',
      items: [
        'Use any stable ID from your own system: 8 to 64 characters from A-Z, a-z, 0-9 and . _ : -',
        'Never send an email, name or phone number. Values with @ are refused.',
        'Send the same ID for the same person every time, on every call, including photo calls.',
        'Each end user can make up to 60 calls a minute. Other users of your app are not affected when one goes over.',
        'While your account is in its integration period, calls without the header still work and are counted on your Enterprise dashboard. Once the header is required, they return 400.',
      ],
    },
    {
      kind: 'code',
      title: 'Request with an end-user ID',
      code: 'curl "https://calorieapiadmin.com/api/v1/search/foods?q=greek%20yogurt" \\\n  -H "X-API-Key: your_api_key_here" \\\n  -H "X-End-User-Id: user_8f3a2c91"',
    },
    {
      kind: 'params',
      title: 'End-user ID errors',
      rows: [
        { name: '400 end_user_id_required', description: 'The header is required on this account and was missing.' },
        { name: '400 end_user_id_invalid', description: 'The ID breaks the format rules above.' },
        { name: '403 end_user_blocked', description: 'This end user is blocked until 00:00 UTC after unusual activity. Other users keep working.' },
        { name: '429 end_user_rate_limited', description: 'This end user is over 60 calls a minute. Retry after the Retry-After header.' },
      ],
    },
    { kind: 'h2', text: 'Limit-related status codes', id: 'status-codes' },
    {
      kind: 'params',
      title: 'Status codes',
      rows: [
        { name: '400', description: 'paging_limit: skip plus limit goes past the first 1,000 results. Enterprise only: end_user_id_required or end_user_id_invalid.' },
        { name: '429', description: 'Per-minute rate limit exceeded. Back off and retry after X-RateLimit-Reset. Enterprise end users over 60 calls a minute get end_user_rate_limited.' },
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
