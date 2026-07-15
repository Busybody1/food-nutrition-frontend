import { API_CONFIG } from '@/lib/config/api'
import type { DocsSectionContent } from '@/lib/docs/types'

const API_BASE = API_CONFIG.baseURL.replace(/\/$/, '')

const RESPONSE_EXAMPLE = `{
  "data": [
    {
      "id": 12345,
      "name": "Apple, raw",
      "brand": "Generic",
      "calories": 52,
      "protein": 0.3,
      "carbs": 13.8,
      "fat": 0.2
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 30
}`

export const FOOD_SEARCH_CONTENT: DocsSectionContent = {
  blocks: [
    {
      kind: 'p',
      text: 'Search foods by name or brand with multi-word matching and relevance ranking. Results include complete nutrition data, per-100g macros, the nutrients array, and serving metadata, and only foods with complete macro data are returned. An empty query returns common and popular foods.',
    },
    {
      kind: 'code',
      title: 'GET /api/v1/search/foods',
      code: `curl "${API_BASE}/api/v1/search/foods?q=chicken+breast&match_mode=all" \\\n  -H "X-API-Key: your_api_key_here"`,
    },
    {
      kind: 'params',
      title: 'Query parameters',
      rows: [
        { name: 'q', description: 'Search query (min 2 characters; empty returns common foods)' },
        { name: 'limit', description: 'Results per page, 1-100 (default: 30). k is accepted as an alias.' },
        { name: 'skip', description: 'Offset for pagination (default: 0)' },
        { name: 'brand', description: 'Filter by brand name (ILIKE)' },
        { name: 'brand_id', description: 'Filter by brand ID' },
        { name: 'category', description: 'Filter by category name (ILIKE)' },
        { name: 'category_id', description: 'Filter by category ID' },
        { name: 'nutrient_id', description: 'Require this nutrient; use with min_amount / max_amount' },
        { name: 'min_amount / max_amount', description: 'Amount range for nutrient_id (requires nutrient_id)' },
        { name: 'min_calories / max_calories', description: 'Macro shortcut filters (also min/max protein, carbs, fat)' },
        { name: 'match_mode', description: '"any" (default) or "all", whether every word must match' },
        { name: 'verified_only', description: 'true to return only verified foods with curated macro data' },
      ],
    },
    { kind: 'json', title: 'Response', code: RESPONSE_EXAMPLE },
    { kind: 'h2', text: 'Verified portions', id: 'portions' },
    {
      kind: 'p',
      text: 'Verified foods expose real household servings from verified_portions. Search returns default_portion and portions_count, sets serving fields from that default, keeps nutrients/*_100g as per-100g baselines, and adds portion_nutrients plus meal scaled by default_portion.grams / 100. Full verified_portions lives on GET /api/v1/foods/{id}. For any other grams, use GET /api/v1/calc/portion or multiply amount_100g * grams / 100.',
    },
    { kind: 'h2', text: 'Lightweight catalog', id: 'catalog' },
    {
      kind: 'p',
      text: 'For food metadata without nutrients and higher page sizes (up to 100), use GET /api/v1/catalog/foods. Single-food meta is GET /api/v1/catalog/foods/{id}. Taxonomy lists live at /catalog/brands, /catalog/categories, and /catalog/nutrients. Full nutrition detail remains on GET /api/v1/foods/{id}.',
    },
    {
      kind: 'code',
      title: 'GET /api/v1/catalog/foods',
      code: `curl "${API_BASE}/api/v1/catalog/foods?category=Dairy&limit=100" \\\n  -H "X-API-Key: your_api_key_here"`,
    },
    { kind: 'h2', text: 'Public demo (no API key)', id: 'public-demo' },
    {
      kind: 'p',
      text: 'The same brand/category/nutrient filters are available on GET /api/v1/public/search/foods and GET /api/v1/public/catalog/* without an API key. Public demos are IP rate limited and use lower max limits (search/catalog foods max 10; taxonomy max 50). Use the /playground UI to try them.',
    },
    {
      kind: 'code',
      title: 'GET /api/v1/public/search/foods',
      code: `curl "${API_BASE}/api/v1/public/search/foods?q=yogurt&category=Dairy&limit=5"`,
    },
    { kind: 'h2', text: 'How ranking works', id: 'ranking' },
    {
      kind: 'list',
      items: [
        'Exact phrase at the start of the name ("chicken breast" matches "Chicken breast, raw") ranks first.',
        'Exact phrase anywhere in the name ranks next.',
        'All words present in any order, or most words for long queries, follows.',
        'First word or any word present ranks last.',
      ],
    },
    { kind: 'h2', text: 'Autocomplete suggest', id: 'suggest' },
    {
      kind: 'p',
      text: 'For typeahead UIs, the suggest endpoint returns lightweight results (id, name, brand_name) so you can render suggestions fast, then fetch full nutrition data with the food details endpoint after the user selects one. Debounce keystrokes in your client to conserve quota.',
    },
    {
      kind: 'code',
      title: 'GET /api/v1/search/suggest',
      code: `curl "${API_BASE}/api/v1/search/suggest?q=chick&limit=10" \\\n  -H "X-API-Key: your_api_key_here"`,
    },
    {
      kind: 'params',
      title: 'Query parameters',
      rows: [
        { name: 'q', description: 'Prefix to autocomplete (min 1 character)' },
        { name: 'limit', description: 'Suggestions to return, 1-20 (default: 15)' },
      ],
    },
  ],
  faqs: [
    {
      q: 'How do I paginate through search results?',
      a: 'Use skip and limit together; the response envelope includes total, so you can compute page counts. limit accepts values up to 100.',
    },
    {
      q: 'When should I use match_mode=all?',
      a: 'Use "all" when precision matters more than recall, for example matching a logged meal name exactly. The default "any" is better for exploratory search UIs.',
    },
    {
      q: 'What does verified_only do?',
      a: 'It restricts results to curated foods with complete, quality-checked macro data. Use it when data accuracy matters more than catalog coverage.',
    },
  ],
}
