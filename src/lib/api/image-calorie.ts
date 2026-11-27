export type ImageCalorieMeter = 'pilot' | 'credits' | 'mcp' | 'enterprise'
export type ImageCalorieKeyProduct = 'rest' | 'mcp'

export interface ImageCaloriePilotUsage {
  used_this_month: number
  monthly_cap: number
  used_today: number
  daily_cap: number
  resets_on: string | null
  ends_on: string | null
}

export interface ImageCalorieCredits {
  balance: number
  cost_per_call: number
  calls_left: number
}

export interface ImageCalorieMcpUsage {
  used_this_month: number
  monthly_cap: number | null
  used_today: number
  daily_cap: number | null
  trial: boolean
}

export interface ImageCalorieEnterpriseUsage {
  photos_used: number
  photos_included: number
  photos_extra: number
  photo_monthly_cap: number
  per_extra_photo_cents: number
  resets_on: string | null
}

export interface ImageCalorieAccess {
  available: boolean
  meter: ImageCalorieMeter | null
  endpoint: string
  method: string
  file_field: string
  formats: string[]
  max_upload_bytes: number
  key_product: ImageCalorieKeyProduct
  pilot: ImageCaloriePilotUsage | null
  credits: ImageCalorieCredits | null
  mcp: ImageCalorieMcpUsage | null
  enterprise: ImageCalorieEnterpriseUsage | null
}

export const IMAGE_CALORIE_ENDPOINT = '/api/v1/vision/calories'
const ACCESS_PATH = '/api/v1/users/image-to-calorie'
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024

export const NO_IMAGE_CALORIE: ImageCalorieAccess = {
  available: false,
  meter: null,
  endpoint: IMAGE_CALORIE_ENDPOINT,
  method: 'POST',
  file_field: 'file',
  formats: ['JPEG', 'PNG', 'WebP'],
  max_upload_bytes: DEFAULT_MAX_BYTES,
  key_product: 'rest',
  pilot: null,
  credits: null,
  mcp: null,
  enterprise: null,
}

type Json = Record<string, unknown>

function isObject(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function count(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
}

function optionalCount(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null
}

function isoDate(value: unknown): string | null {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : null
}

function meterOf(value: unknown): ImageCalorieMeter | null {
  return value === 'pilot' || value === 'credits' || value === 'mcp' || value === 'enterprise' ? value : null
}

function normalizePilot(raw: unknown): ImageCaloriePilotUsage | null {
  if (!isObject(raw)) return null
  return {
    used_this_month: count(raw.used_this_month),
    monthly_cap: count(raw.monthly_cap),
    used_today: count(raw.used_today),
    daily_cap: count(raw.daily_cap),
    resets_on: isoDate(raw.resets_on),
    ends_on: isoDate(raw.ends_on),
  }
}

function normalizeCredits(raw: unknown): ImageCalorieCredits | null {
  if (!isObject(raw)) return null
  const cost = count(raw.cost_per_call) || 1
  const balance = count(raw.balance)
  return { balance, cost_per_call: cost, calls_left: Math.floor(balance / cost) }
}

function normalizeMcp(raw: unknown): ImageCalorieMcpUsage | null {
  if (!isObject(raw)) return null
  return {
    used_this_month: count(raw.used_this_month),
    monthly_cap: optionalCount(raw.monthly_cap),
    used_today: count(raw.used_today),
    daily_cap: optionalCount(raw.daily_cap),
    trial: raw.trial === true,
  }
}

function normalizeEnterprise(raw: unknown): ImageCalorieEnterpriseUsage | null {
  if (!isObject(raw)) return null
  const used = count(raw.photos_used)
  const included = count(raw.photos_included)
  return {
    photos_used: used,
    photos_included: included,
    photos_extra: Math.max(count(raw.photos_extra), used - included, 0),
    photo_monthly_cap: count(raw.photo_monthly_cap),
    per_extra_photo_cents: optionalCount(raw.per_extra_photo_cents) ?? 1,
    resets_on: isoDate(raw.resets_on),
  }
}

export function normalizeImageCalorieAccess(raw: unknown): ImageCalorieAccess {
  if (!isObject(raw) || raw.available !== true) return NO_IMAGE_CALORIE
  const meter = meterOf(raw.meter)
  if (!meter) return NO_IMAGE_CALORIE
  const formats = Array.isArray(raw.formats)
    ? raw.formats.filter((item): item is string => typeof item === 'string' && item.length > 0)
    : []
  const endpoint =
    typeof raw.endpoint === 'string' && raw.endpoint.startsWith('/') ? raw.endpoint : IMAGE_CALORIE_ENDPOINT
  return {
    available: true,
    meter,
    endpoint,
    method: typeof raw.method === 'string' && raw.method ? raw.method.toUpperCase() : 'POST',
    file_field: typeof raw.file_field === 'string' && raw.file_field ? raw.file_field : 'file',
    formats: formats.length > 0 ? formats : NO_IMAGE_CALORIE.formats,
    max_upload_bytes: count(raw.max_upload_bytes) || DEFAULT_MAX_BYTES,
    key_product: raw.key_product === 'mcp' || meter === 'mcp' ? 'mcp' : 'rest',
    pilot: meter === 'pilot' ? normalizePilot(raw.pilot) : null,
    credits: meter === 'credits' ? normalizeCredits(raw.credits) : null,
    mcp: meter === 'mcp' ? normalizeMcp(raw.mcp) : null,
    enterprise: meter === 'enterprise' ? normalizeEnterprise(raw.enterprise) : null,
  }
}

export interface ImageCalorieHttpClient {
  get<T>(endpoint: string, params?: Record<string, unknown>): Promise<{ data: T }>
}

export function createImageCalorieApi(client: ImageCalorieHttpClient) {
  return {
    async access(): Promise<ImageCalorieAccess> {
      const res = await client.get<unknown>(ACCESS_PATH)
      return normalizeImageCalorieAccess(res.data)
    },
  }
}
