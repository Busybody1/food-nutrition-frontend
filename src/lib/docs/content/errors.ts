import type { DocsSectionContent } from '@/lib/docs/types'

export const ERRORS_CONTENT: DocsSectionContent = {
  blocks: [
    {
      kind: 'p',
      text: 'API error handling uses HTTP status codes and a JSON detail string. A missing API key is 401. A monthly quota miss is 402. A problem on our side is 5xx.',
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
        { name: '400', description: 'Bad request from an explicit validation check (e.g. query too short, bad match_mode). detail is a human-readable string. Paging past the first 1,000 results returns detail.code paging_limit.' },
        { name: '401', description: 'Unauthorized, missing or invalid API key.' },
        { name: '402', description: 'Monthly quota exceeded for your plan.' },
        { name: '403', description: 'Forbidden — commercial use not allowed on your plan, the endpoint is not enabled for your plan, or a food-coverage limit was reached.' },
        { name: '404', description: 'Not found, unknown food ID or barcode with no match in any source.' },
        { name: '422', description: 'Unprocessable entity from schema validation (missing or out-of-range query/body params, e.g. limit=500 or a calc call missing required fields). Here detail is an array of field errors, not a string.' },
        { name: '423', description: 'Locked — your account is on a temporary security hold due to unusual activity. Not retryable; contact support to restore access.' },
        { name: '429', description: 'Rate limited, per-minute limit exceeded; see X-RateLimit-Reset.' },
        { name: '500', description: 'Server error, safe to retry with backoff; report persistent failures.' },
      ],
    },
    { kind: 'h2', text: 'Errors with a code', id: 'coded-errors' },
    {
      kind: 'p',
      text: 'Some limits return an object in detail with a code and a message instead of a plain string. Check for detail.code before reading detail as text.',
    },
    {
      kind: 'json',
      title: 'Coded error body',
      code: `{\n  "detail": {\n    "code": "end_user_id_required",\n    "message": "This account must send an anonymous ID for the person using your app in the X-End-User-Id header on every call."\n  }\n}`,
    },
    {
      kind: 'params',
      title: 'Codes',
      rows: [
        { name: 'paging_limit (400)', description: 'skip plus limit goes past the first 1,000 results. Narrow the query.' },
        { name: 'end_user_id_required (400)', description: 'Enterprise: the X-End-User-Id header is required and was missing.' },
        { name: 'end_user_id_invalid (400)', description: 'Enterprise: the X-End-User-Id value breaks the format rules.' },
        { name: 'end_user_blocked (403)', description: 'Enterprise: this end user is blocked until 00:00 UTC.' },
        { name: 'end_user_rate_limited (429)', description: 'Enterprise: this end user is over 60 calls a minute.' },
      ],
    },
    { kind: 'h2', text: 'Retry guidance', id: 'retries' },
    {
      kind: 'list',
      items: [
        '429: retry after the X-RateLimit-Reset time with exponential backoff and jitter.',
        '400 and 422: do not retry as-is; fix the request. 422 detail is an array of per-field errors.',
        '429 end_user_rate_limited: slow down that one end user and retry after Retry-After. Your other users are not affected.',
        '402 and 403: do not retry, these persist until the plan or usage state changes.',
        '423: do not retry; the account is on a temporary security hold. Contact support@busybodyservice.com to restore access.',
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
