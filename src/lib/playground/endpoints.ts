export type PlaygroundParam = {
  key: string
  label: string
  placeholder?: string
  defaultValue?: string
  required?: boolean
  type?: 'text' | 'number' | 'select'
  options?: { value: string; label: string }[]
}

export type PlaygroundEndpoint = {
  id: string
  name: string
  description: string
  method: 'GET' | 'POST'
  /** Path under `/api/v1/public`, may include `{param}` segments. */
  pathTemplate: string
  params: PlaygroundParam[]
  /** Default JSON body string for POST endpoints. */
  defaultBody?: string
}

export const PUBLIC_DEMO_RATE_LIMIT = {
  hourly: 30,
  minIntervalSec: 1,
} as const

const FOOD_FILTER_PARAMS: PlaygroundParam[] = [
  { key: 'brand', label: 'Brand name', placeholder: 'Organic' },
  { key: 'brand_id', label: 'Brand ID', placeholder: '12', type: 'number' },
  { key: 'category', label: 'Category name', placeholder: 'Dairy' },
  { key: 'category_id', label: 'Category ID', placeholder: '5', type: 'number' },
  { key: 'nutrient_id', label: 'Nutrient ID', placeholder: '106899', type: 'number' },
  { key: 'min_amount', label: 'Min amount', placeholder: '10', type: 'number' },
  { key: 'max_amount', label: 'Max amount', placeholder: '40', type: 'number' },
  { key: 'min_calories', label: 'Min calories', placeholder: '50', type: 'number' },
  { key: 'max_calories', label: 'Max calories', placeholder: '400', type: 'number' },
  { key: 'min_protein', label: 'Min protein', placeholder: '5', type: 'number' },
  { key: 'max_protein', label: 'Max protein', placeholder: '30', type: 'number' },
]

export const PLAYGROUND_ENDPOINTS: PlaygroundEndpoint[] = [
  {
    id: 'search-foods',
    name: 'Search foods',
    description:
      'Search foods with brand, category, and nutrient filters. Returns macros per 100 g and nutrient arrays.',
    method: 'GET',
    pathTemplate: '/search/foods',
    params: [
      { key: 'q', label: 'Query', placeholder: 'apple', defaultValue: 'apple', required: true },
      { key: 'limit', label: 'Limit', placeholder: '5', defaultValue: '5', type: 'number' },
      { key: 'skip', label: 'Skip', placeholder: '0', defaultValue: '0', type: 'number' },
      {
        key: 'match_mode',
        label: 'Match mode',
        type: 'select',
        defaultValue: 'any',
        options: [
          { value: 'any', label: 'Any words' },
          { value: 'all', label: 'All words' },
        ],
      },
      {
        key: 'verified_only',
        label: 'Verified only',
        type: 'select',
        defaultValue: 'false',
        options: [
          { value: 'false', label: 'No' },
          { value: 'true', label: 'Yes' },
        ],
      },
      ...FOOD_FILTER_PARAMS,
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
  {
    id: 'catalog-foods',
    name: 'Catalog foods (meta)',
    description:
      'List food metadata only (no nutrients). Same brand/category/nutrient filters; demo limit max 10.',
    method: 'GET',
    pathTemplate: '/catalog/foods',
    params: [
      { key: 'q', label: 'Query', placeholder: 'yogurt' },
      { key: 'limit', label: 'Limit', placeholder: '5', defaultValue: '5', type: 'number' },
      { key: 'skip', label: 'Skip', placeholder: '0', defaultValue: '0', type: 'number' },
      ...FOOD_FILTER_PARAMS,
    ],
  },
  {
    id: 'catalog-food',
    name: 'Catalog food by ID',
    description: 'Single food metadata only (no nutrients or barcodes).',
    method: 'GET',
    pathTemplate: '/catalog/foods/{food_id}',
    params: [
      { key: 'food_id', label: 'Food ID', placeholder: '12345', defaultValue: '12345', required: true, type: 'number' },
    ],
  },
  {
    id: 'catalog-brands',
    name: 'Catalog brands',
    description: 'List brands for filter pickers.',
    method: 'GET',
    pathTemplate: '/catalog/brands',
    params: [
      { key: 'q', label: 'Search', placeholder: 'organic' },
      { key: 'limit', label: 'Limit', placeholder: '20', defaultValue: '20', type: 'number' },
      { key: 'skip', label: 'Skip', placeholder: '0', defaultValue: '0', type: 'number' },
    ],
  },
  {
    id: 'catalog-categories',
    name: 'Catalog categories',
    description: 'List categories for filter pickers.',
    method: 'GET',
    pathTemplate: '/catalog/categories',
    params: [
      { key: 'q', label: 'Search', placeholder: 'dairy' },
      { key: 'limit', label: 'Limit', placeholder: '20', defaultValue: '20', type: 'number' },
      { key: 'skip', label: 'Skip', placeholder: '0', defaultValue: '0', type: 'number' },
    ],
  },
  {
    id: 'catalog-nutrients',
    name: 'Catalog nutrients',
    description: 'List nutrient taxonomy (id, name, unit) for filter pickers.',
    method: 'GET',
    pathTemplate: '/catalog/nutrients',
    params: [
      { key: 'q', label: 'Search', placeholder: 'protein' },
      { key: 'limit', label: 'Limit', placeholder: '20', defaultValue: '20', type: 'number' },
      { key: 'skip', label: 'Skip', placeholder: '0', defaultValue: '0', type: 'number' },
    ],
  },
  {
    id: 'calc-macros',
    name: 'Macro calculator',
    description:
      'Calculate BMR, TDEE, and daily macro targets (protein, carbs, fat) from body stats using the Mifflin-St Jeor formula.',
    method: 'GET',
    pathTemplate: '/calc/macros',
    params: [
      { key: 'age', label: 'Age', placeholder: '28', defaultValue: '28', required: true, type: 'number' },
      {
        key: 'gender',
        label: 'Gender',
        required: true,
        type: 'select',
        defaultValue: 'male',
        options: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
        ],
      },
      { key: 'weight_kg', label: 'Weight (kg)', placeholder: '80', defaultValue: '80', required: true, type: 'number' },
      { key: 'height_cm', label: 'Height (cm)', placeholder: '178', defaultValue: '178', required: true, type: 'number' },
      {
        key: 'activity',
        label: 'Activity level',
        required: true,
        type: 'select',
        defaultValue: 'moderately_active',
        options: [
          { value: 'sedentary', label: 'Sedentary' },
          { value: 'lightly_active', label: 'Lightly active' },
          { value: 'moderately_active', label: 'Moderately active' },
          { value: 'very_active', label: 'Very active' },
          { value: 'extra_active', label: 'Extra active' },
        ],
      },
      {
        key: 'goal',
        label: 'Goal',
        required: true,
        type: 'select',
        defaultValue: 'maintain',
        options: [
          { value: 'lose', label: 'Lose weight' },
          { value: 'maintain', label: 'Maintain' },
          { value: 'gain', label: 'Gain muscle' },
        ],
      },
    ],
  },
  {
    id: 'calc-portion',
    name: 'Portion scaler',
    description:
      "Scale a food's nutrition to any gram amount. Enter a food ID from search and the number of grams to get exact macros for that serving.",
    method: 'GET',
    pathTemplate: '/calc/portion',
    params: [
      { key: 'food_id', label: 'Food ID', placeholder: '12345', defaultValue: '12345', required: true, type: 'number' },
      { key: 'grams', label: 'Grams', placeholder: '150', defaultValue: '150', required: true, type: 'number' },
    ],
  },
  {
    id: 'calc-recipe',
    name: 'Recipe analyzer',
    description:
      'Post a list of ingredients (food_id + grams each) and get total and per-serving macros for the full recipe.',
    method: 'POST',
    pathTemplate: '/calc/recipe',
    params: [],
    defaultBody: JSON.stringify(
      {
        servings: 4,
        ingredients: [
          { food_id: 12345, grams: 300 },
          { food_id: 67890, grams: 200 },
        ],
      },
      null,
      2
    ),
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

export function initialBody(endpoint: PlaygroundEndpoint): string {
  return endpoint.defaultBody ?? ''
}
