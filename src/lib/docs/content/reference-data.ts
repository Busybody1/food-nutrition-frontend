import { API_CONFIG } from '@/lib/config/api'
import type { DocsSectionContent } from '@/lib/docs/types'

const API_BASE = API_CONFIG.baseURL.replace(/\/$/, '')

export const REFERENCE_DATA_CONTENT: DocsSectionContent = {
  blocks: [
    {
      kind: 'p',
      text: 'Paginated reference endpoints expose the taxonomy behind the food catalog. Use them to build filter dropdowns, map your own nutrition models, or validate data coming from search. Authenticated catalog lists: /api/v1/catalog/brands|categories|nutrients. Public demos (no key, IP limited): /api/v1/public/catalog/brands|categories|nutrients.',
    },
    { kind: 'h2', text: 'Nutrients', id: 'nutrients' },
    {
      kind: 'p',
      text: 'List the nutrient definitions used in food payloads, macronutrients, vitamins, and minerals with their units.',
    },
    {
      kind: 'code',
      title: 'GET /api/v1/catalog/nutrients',
      code: `curl "${API_BASE}/api/v1/catalog/nutrients" \\\n  -H "X-API-Key: your_api_key_here" \\\n  -G -d "limit=50" -d "skip=0"`,
    },
    { kind: 'h2', text: 'Brands', id: 'brands' },
    {
      kind: 'p',
      text: 'Browse brand records referenced by branded foods. Combine with the brand filter on food search to scope results to a manufacturer.',
    },
    {
      kind: 'code',
      title: 'GET /api/v1/catalog/brands',
      code: `curl "${API_BASE}/api/v1/catalog/brands" \\\n  -H "X-API-Key: your_api_key_here" \\\n  -G -d "limit=100" -d "skip=0"`,
    },
    { kind: 'h2', text: 'Categories', id: 'categories' },
    {
      kind: 'p',
      text: 'Access food categories and subcategories for organizing and filtering foods in your UI.',
    },
    {
      kind: 'code',
      title: 'GET /api/v1/catalog/categories',
      code: `curl "${API_BASE}/api/v1/catalog/categories" \\\n  -H "X-API-Key: your_api_key_here" \\\n  -G -d "limit=50" -d "skip=0"`,
    },
    {
      kind: 'params',
      title: 'Query parameters (all three endpoints)',
      rows: [
        { name: 'limit', description: 'Results per page, 1–1000 (default: 100)' },
        { name: 'skip', description: 'Offset for pagination (default: 0)' },
        { name: 'search', description: 'Optional name filter (min 2 characters). q is accepted as an alias.' },
      ],
    },
    {
      kind: 'p',
      text: 'All three return the standard paginated envelope (data, total, skip, limit). Reference data changes rarely, so it is a good candidate for caching in your application.',
    },
  ],
  faqs: [
    {
      q: 'How often does reference data change?',
      a: 'Rarely; nutrients, brands, and categories evolve with catalog updates but are stable enough to cache for a day or longer in your application.',
    },
    {
      q: 'Can I search brands by name?',
      a: 'Yes. Add search={name} (min 2 characters) to GET /api/v1/catalog/brands to name-filter the list. GET /api/v1/search/brands?q={name} also performs a brand name search.',
    },
  ],
}
