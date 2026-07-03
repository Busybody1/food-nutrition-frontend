import { API_CONFIG } from '@/lib/config/api'
import type { DocsSectionContent } from '@/lib/docs/types'
import {
  BARCODE_LOOKUP_EXAMPLE_JSON,
  BARCODE_LOOKUP_FIELDS,
} from '@/lib/docs/barcode-lookup'

const API_BASE = API_CONFIG.baseURL.replace(/\/$/, '')

export const BARCODE_LOOKUP_CONTENT: DocsSectionContent = {
  blocks: [
    {
      kind: 'p',
      text: 'Resolve a UPC or EAN barcode to product and nutrition data. The API checks the local food database first; when no match is found, it falls back to Open Food Facts and returns only the fields needed for logging: product details, serving size, macros per 100 g (and per serving when available), and micronutrients when present.',
    },
    {
      kind: 'code',
      title: 'GET /api/v1/search/barcode/{upc}',
      code: `curl "${API_BASE}/api/v1/search/barcode/3017620422003" \\\n  -H "X-API-Key: your_api_key_here"`,
    },
    {
      kind: 'params',
      title: 'Path parameters',
      rows: [{ name: 'upc', description: 'UPC/EAN barcode (digits; dashes are stripped)' }],
    },
    { kind: 'json', title: 'Response example (Nutella)', code: BARCODE_LOOKUP_EXAMPLE_JSON },
    { kind: 'h2', text: 'Response fields', id: 'fields' },
    {
      kind: 'params',
      title: 'Response fields',
      rows: BARCODE_LOOKUP_FIELDS.map((f) => ({ name: f.field, description: f.description })),
    },
    {
      kind: 'p',
      text: 'Open Food Facts raw payloads include thousands of metadata fields; this endpoint strips that down to logging-ready product and nutrition data, so the response shape is identical whether the product came from the local catalog or the fallback.',
    },
    { kind: 'h2', text: 'Handling misses', id: 'misses' },
    {
      kind: 'p',
      text: 'If neither the local database nor Open Food Facts knows the barcode, the API returns HTTP 404 with a "Food not found for barcode" message. A good pattern is to fall back to food search in your UI so the user can log the item manually.',
    },
  ],
  faqs: [
    {
      q: 'Which barcode formats are supported?',
      a: 'UPC and EAN barcodes. Pass the digits in the URL path; dashes are stripped automatically.',
    },
    {
      q: 'Is the Open Food Facts fallback automatic?',
      a: 'Yes. The lookup order is always local catalog first, then Open Food Facts, with a single normalized response shape either way, your client code does not need to know the source.',
    },
    {
      q: 'Why are some nutrition fields null?',
      a: 'Label data varies by product and region. Fields the source does not provide (for example fiber or per-serving values) are null rather than omitted, so your parsers stay simple.',
    },
  ],
}
