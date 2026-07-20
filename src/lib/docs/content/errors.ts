import type { DocsSectionContent } from '@/lib/docs/types'

export const ERRORS_CONTENT: DocsSectionContent = {
  blocks: [
    {
      kind: 'p',
      text: 'Errors use conventional HTTP status codes with a JSON body containing a human-readable detail message. Client errors (4xx) indicate a problem with the request or account state; 5xx indicates a problem on our side.',
    },
    {
      kind: 'json',
      title: 'Error response body',
      code: `{\n  "detail": "Search query must be at least 2 characters or empty for common foods."\n}`,
    },
    {
      kind: 'params',
      title: 'Status codes',
      rows: [
        { name: '400', description: 'Bad request, invalid parameters (e.g. query too short, bad match_mode).' },
        { name: '401', description: 'Unauthorized, missing or invalid API key.' },
        { name: '402', description: 'Monthly quota exceeded for your plan.' },
        { name: '403', description: 'Forbidden, commercial use not allowed on plan, or an account protection limit was reached.' },
        { name: '404', description: 'Not found, unknown food ID or barcode with no match in any source.' },
        { name: '429', description: 'Rate limited, per-minute limit exceeded; see X-RateLimit-Reset.' },
        { name: '500', description: 'Server error, safe to retry with backoff; report persistent failures.' },
      ],
    },
    { kind: 'h2', text: 'Retry guidance', id: 'retries' },
    {
      kind: 'list',
      items: [
        '429: retry after the X-RateLimit-Reset time with exponential backoff and jitter.',
        '402 and 403: do not retry, these persist until the plan or usage state changes.',
        '404 on barcode lookup: fall back to food search so users can log the item manually.',
        '5xx: retry with backoff; if errors persist, check the status page and contact support.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Should I retry 402 quota errors?',
      a: 'No. 402 persists until your monthly cycle resets or you upgrade. Detect it, surface an upgrade path in your admin tooling, and stop retrying.',
    },
    {
      q: 'How do I distinguish a rate limit from a quota error?',
      a: 'Per-minute rate limiting returns 429 with X-RateLimit-* headers; monthly quota exhaustion returns 402. Handle them separately, 429 is transient, 402 is not.',
    },
  ],
}
