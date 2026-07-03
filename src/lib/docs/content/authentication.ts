import { API_CONFIG } from '@/lib/config/api'
import type { DocsSectionContent } from '@/lib/docs/types'

const API_BASE = API_CONFIG.baseURL.replace(/\/$/, '')

export const AUTHENTICATION_CONTENT: DocsSectionContent = {
  blocks: [
    {
      kind: 'p',
      text: 'All API requests are authenticated with an API key sent in the X-API-Key header. Keys are generated in the developer dashboard after creating an account, and each key is tied to your plan’s rate limits and monthly quota.',
    },
    {
      kind: 'code',
      title: 'Authenticated request',
      code: `curl "${API_BASE}/api/v1/search/foods?q=apple" \\\n  -H "X-API-Key: your_api_key_here"`,
    },
    { kind: 'h2', text: 'Getting an API key', id: 'get-a-key' },
    {
      kind: 'list',
      items: [
        'Create a free account, no credit card required for the Free tier.',
        'Choose a plan (you can start on Free and upgrade later).',
        'Generate a key from the dashboard under API Keys.',
      ],
    },
    { kind: 'h2', text: 'Keep your API key secure', id: 'security' },
    {
      kind: 'p',
      text: 'Never expose your API key in client-side code or public repositories. Call the API from your backend, or proxy requests through your own server, and store keys in environment variables or a secrets manager. Keys are hashed at rest on our side and can be revoked and regenerated from the dashboard at any time.',
    },
    { kind: 'h2', text: 'Authentication errors', id: 'auth-errors' },
    {
      kind: 'params',
      title: 'Auth-related status codes',
      rows: [
        { name: '401', description: 'Missing or invalid API key. Check the X-API-Key header.' },
        { name: '402', description: 'Monthly quota exceeded. Upgrade your plan or wait for the cycle reset.' },
        { name: '403', description: 'Commercial use not allowed on your plan, or food coverage cap reached.' },
      ],
    },
    {
      kind: 'p',
      text: 'Dashboard sessions use JWT authentication after sign-in; API traffic from your applications should always use API keys.',
    },
  ],
  faqs: [
    {
      q: 'Can I use the API key in a mobile app directly?',
      a: 'Avoid shipping raw API keys in mobile binaries, they can be extracted. Route requests through your backend so the key stays server-side, and enforce your own per-user limits in front of it.',
    },
    {
      q: 'How do I rotate an API key?',
      a: 'Generate a new key in the dashboard, deploy it to your services, then revoke the old key. Revocation is immediate.',
    },
    {
      q: 'Do I need different keys for staging and production?',
      a: 'It is good practice to create separate keys per environment so you can revoke or monitor them independently in the dashboard.',
    },
  ],
}
