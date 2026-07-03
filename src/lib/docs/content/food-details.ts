import { API_CONFIG } from '@/lib/config/api'
import type { DocsSectionContent } from '@/lib/docs/types'

const API_BASE = API_CONFIG.baseURL.replace(/\/$/, '')

export const FOOD_DETAILS_CONTENT: DocsSectionContent = {
  blocks: [
    {
      kind: 'p',
      text: 'Fetch the complete nutrition payload for a single food by its ID, typically after a user picks a result from search or autocomplete suggest. The response includes per-100g macro values, the full structured nutrients array (micronutrients when available), and serving metadata for meal logging.',
    },
    {
      kind: 'code',
      title: 'GET /api/v1/foods/{id}',
      code: `curl "${API_BASE}/api/v1/foods/12345" \\\n  -H "X-API-Key: your_api_key_here"`,
    },
    {
      kind: 'params',
      title: 'Path parameters',
      rows: [{ name: 'id', description: 'Food ID from search, suggest, or list responses' }],
    },
    { kind: 'h2', text: 'Typical flow', id: 'flow' },
    {
      kind: 'list',
      items: [
        'Autocomplete with /search/suggest while the user types (lightweight id + name payloads).',
        'Fetch /foods/{id} when the user selects a suggestion to get full macros and nutrients.',
        'Store the food ID with the log entry so re-logging skips the search step.',
      ],
    },
    {
      kind: 'p',
      text: 'Food IDs are stable, so caching details client-side or in your backend is safe and saves quota for frequently logged foods.',
    },
  ],
  faqs: [
    {
      q: 'Are food IDs stable across time?',
      a: 'Yes, IDs are stable identifiers, so you can persist them with user logs and re-fetch details later.',
    },
    {
      q: 'Does the details endpoint include micronutrients?',
      a: 'Yes, when available. The nutrients array covers vitamins and minerals alongside the guaranteed per-100g macro set.',
    },
  ],
}
