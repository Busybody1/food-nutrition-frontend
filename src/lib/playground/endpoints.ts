export type PlaygroundParam = {
  key: string
  label: string
  placeholder?: string
  defaultValue?: string
  required?: boolean
  type?: 'text' | 'number'
}

export type PlaygroundEndpoint = {
  id: string
  name: string
  description: string
  method: 'GET'
  /** Path under `/api/v1/public`, may include `{param}` segments. */
  pathTemplate: string
  params: PlaygroundParam[]
}

export const PUBLIC_DEMO_RATE_LIMIT = {
  hourly: 30,
  minIntervalSec: 1,
} as const

export const PLAYGROUND_ENDPOINTS: PlaygroundEndpoint[] = [
  {
    id: 'search-foods',
    name: 'Search foods',
    description: 'Search the food catalog by name or brand. Returns macros per 100 g and nutrient arrays.',
    method: 'GET',
    pathTemplate: '/search/foods',
    params: [
      { key: 'q', label: 'Query', placeholder: 'apple', defaultValue: 'apple', required: true },
      { key: 'limit', label: 'Limit', placeholder: '5', defaultValue: '5', type: 'number' },
      { key: 'skip', label: 'Skip', placeholder: '0', defaultValue: '0', type: 'number' },
    ],
  },
  {
    id: 'suggest',
    name: 'Suggest',
    description: 'Autocomplete food names for search boxes and meal logging UIs.',
    method: 'GET',
    pathTemplate: '/search/suggest',
    params: [
      { key: 'q', label: 'Query', placeholder: 'chi', defaultValue: 'chi', required: true },
      { key: 'limit', label: 'Limit', placeholder: '8', defaultValue: '8', type: 'number' },
    ],
  },
  {
    id: 'barcode',
    name: 'Barcode lookup',
    description:
      'Resolve a UPC/EAN to product and nutrition data. Uses the local database first, then Open Food Facts.',
    method: 'GET',
    pathTemplate: '/search/barcode/{upc}',
    params: [
      {
        key: 'upc',
        label: 'Barcode (UPC/EAN)',
        placeholder: '3017620422003',
        defaultValue: '3017620422003',
        required: true,
      },
    ],
  },
  {
    id: 'food-details',
    name: 'Food details',
    description: 'Fetch full nutrient and serving data for a food id returned from search.',
    method: 'GET',
    pathTemplate: '/foods/{food_id}',
    params: [
      { key: 'food_id', label: 'Food ID', placeholder: '12345', defaultValue: '12345', required: true, type: 'number' },
    ],
  },
]

export function buildPlaygroundUrl(
  apiBase: string,
  endpoint: PlaygroundEndpoint,
  values: Record<string, string>
): string {
  const base = `${apiBase.replace(/\/$/, '')}/api/v1/public`
  let path = endpoint.pathTemplate
  const pathParamKeys = new Set<string>()

  for (const param of endpoint.params) {
    const segment = `{${param.key}}`
    if (!path.includes(segment)) {
      continue
    }
    pathParamKeys.add(param.key)
    path = path.replace(segment, encodeURIComponent(values[param.key] ?? ''))
  }

  const query = new URLSearchParams()
  for (const param of endpoint.params) {
    if (pathParamKeys.has(param.key)) {
      continue
    }
    const value = values[param.key]
    if (value !== undefined && value !== '') {
      query.set(param.key, value)
    }
  }

  const queryString = query.toString()
  return queryString ? `${base}${path}?${queryString}` : `${base}${path}`
}

export function initialParamValues(endpoint: PlaygroundEndpoint): Record<string, string> {
  return Object.fromEntries(
    endpoint.params.map((param) => [param.key, param.defaultValue ?? ''])
  )
}
