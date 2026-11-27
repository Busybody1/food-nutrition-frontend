export type AdminEndUserMode = 'off' | 'warn' | 'required'
export type AdminTone = 'neutral' | 'green' | 'orange' | 'rose' | 'indigo' | 'outline'

export interface AdminEnterpriseConfigFields {
  is_active: boolean
  end_user_mode: AdminEndUserMode | string | null
  per_extra_user_cents: number | null
  per_1k_extra_calls_cents: number | null
  per_extra_photo_cents: number | null
  calls_per_extra_user: number | null
  photos_included: number | null
  photo_monthly_cap: number | null
  unique_foods_pct_override: number | null
  coverage_12m_pct_override: number | null
  end_user_records_allowed: boolean
  started_on: string | null
  notes: string | null
}

export interface AdminEnterpriseBody {
  is_active: boolean
  end_user_mode: AdminEndUserMode
  per_extra_user_cents: number | null
  per_1k_extra_calls_cents: number | null
  per_extra_photo_cents: number | null
  calls_per_extra_user: number | null
  photos_included: number | null
  photo_monthly_cap: number | null
  unique_foods_pct_override: number | null
  coverage_12m_pct_override: number | null
  end_user_records_allowed: boolean
  started_on: string | null
  notes: string | null
}

export type NumberFieldKey =
  | 'per_extra_user_cents'
  | 'per_1k_extra_calls_cents'
  | 'per_extra_photo_cents'
  | 'calls_per_extra_user'
  | 'photos_included'
  | 'photo_monthly_cap'
  | 'unique_foods_pct_override'
  | 'coverage_12m_pct_override'

export interface NumberField {
  key: NumberFieldKey
  label: string
  min: number
  max: number
  hint: string
}

export const NUMBER_FIELDS: NumberField[] = [
  { key: 'per_extra_user_cents', label: 'Per extra user (cents)', min: 0, max: 10000, hint: 'Above the top tier' },
  { key: 'calls_per_extra_user', label: 'Calls per extra user', min: 0, max: 1000000, hint: 'Added to the allowance for each extra user' },
  { key: 'per_1k_extra_calls_cents', label: 'Per 1,000 extra calls (cents)', min: 0, max: 100000, hint: 'Past the top allowance' },
  { key: 'photos_included', label: 'Photos included a month', min: 0, max: 10000000, hint: 'Before per-photo charges' },
  { key: 'per_extra_photo_cents', label: 'Per extra photo (cents)', min: 0, max: 10000, hint: 'After the included photos' },
  { key: 'photo_monthly_cap', label: 'Photo safety limit a month', min: 0, max: 10000000, hint: 'Photo calls return 429 past this' },
  { key: 'unique_foods_pct_override', label: 'Monthly food cap (%)', min: 1, max: 100, hint: 'Share of the catalog a month. Blank uses the plan' },
  { key: 'coverage_12m_pct_override', label: '12-month food cap (%)', min: 1, max: 100, hint: 'Share of the catalog over 12 months. Blank uses the setting' },
]

export const NOTES_MAX = 500

export type EnterpriseDraft = {
  isActive: boolean
  mode: AdminEndUserMode
  recordsAllowed: boolean
  startedOn: string
  notes: string
} & Record<NumberFieldKey, string>

function modeOf(value: unknown): AdminEndUserMode {
  return value === 'off' || value === 'required' ? value : 'warn'
}

function numberText(value: number | null | undefined): string {
  return value === null || value === undefined ? '' : String(value)
}

export function initialEnterpriseDraft(config: AdminEnterpriseConfigFields | null): EnterpriseDraft {
  const draft = {
    isActive: config ? config.is_active : true,
    mode: modeOf(config?.end_user_mode),
    recordsAllowed: config ? config.end_user_records_allowed : false,
    startedOn: config?.started_on ? config.started_on.slice(0, 10) : '',
    notes: config?.notes ?? '',
  } as EnterpriseDraft
  for (const field of NUMBER_FIELDS) {
    draft[field.key] = numberText(config ? config[field.key] : null)
  }
  return draft
}

export function parseWhole(value: string): number | null | 'invalid' {
  const trimmed = value.trim().replace(/,/g, '')
  if (!trimmed) return null
  if (!/^\d+$/.test(trimmed)) return 'invalid'
  const n = Number(trimmed)
  return Number.isSafeInteger(n) ? n : 'invalid'
}

export function enterpriseDraftError(draft: EnterpriseDraft): string | null {
  for (const field of NUMBER_FIELDS) {
    const parsed = parseWhole(draft[field.key])
    if (parsed === 'invalid') return `${field.label}: enter a whole number or leave it blank.`
    if (parsed !== null && (parsed < field.min || parsed > field.max)) {
      return `${field.label}: use ${field.min.toLocaleString('en-US')} to ${field.max.toLocaleString('en-US')}.`
    }
  }
  if (draft.startedOn && !/^\d{4}-\d{2}-\d{2}$/.test(draft.startedOn)) return 'Start date: pick a date or leave it blank.'
  if (draft.notes.trim().length > NOTES_MAX) return `Notes: keep it to ${NOTES_MAX} characters.`
  return null
}

export function enterpriseRequestBody(draft: EnterpriseDraft): AdminEnterpriseBody | null {
  if (enterpriseDraftError(draft)) return null
  const body = {
    is_active: draft.isActive,
    end_user_mode: draft.mode,
    end_user_records_allowed: draft.recordsAllowed,
    started_on: draft.startedOn || null,
    notes: draft.notes.trim().replace(/\s+/g, ' ') || null,
  } as AdminEnterpriseBody
  for (const field of NUMBER_FIELDS) {
    body[field.key] = parseWhole(draft[field.key]) as number | null
  }
  return body
}

export function enterpriseDraftChanged(config: AdminEnterpriseConfigFields | null, draft: EnterpriseDraft): boolean {
  const before = JSON.stringify(initialEnterpriseDraft(config))
  return config === null || before !== JSON.stringify(draft)
}

export function modeLabel(mode: AdminEndUserMode): string {
  if (mode === 'required') return 'Required'
  if (mode === 'off') return 'Off'
  return 'Warn only'
}

const INCIDENT_KINDS: Record<string, { label: string; tone: AdminTone }> = {
  breadth_foods: { label: 'Scrape breadth', tone: 'rose' },
  volume_hourly: { label: 'Volume, hourly', tone: 'orange' },
  volume_daily: { label: 'Volume, daily', tone: 'orange' },
  manual: { label: 'Manual', tone: 'neutral' },
  scrape_orphan_lookups: { label: 'Unseen food lookups', tone: 'rose' },
  scrape_id_404s: { label: 'Food ID guessing', tone: 'rose' },
  scrape_deep_paging: { label: 'Deep paging', tone: 'orange' },
  scrape_result_breadth: { label: 'Result breadth', tone: 'rose' },
  scrape_end_user_breadth: { label: 'One end user, many foods', tone: 'orange' },
  scrape_rare_share: { label: 'Rare foods', tone: 'rose' },
  scrape_coverage_12m: { label: '12-month coverage', tone: 'orange' },
}

export function incidentKindLabel(kind: string): { label: string; tone: AdminTone } {
  const known = INCIDENT_KINDS[kind]
  if (known) return known
  const readable = kind.replace(/^scrape_/, '').replace(/_/g, ' ').trim()
  return { label: readable ? readable.charAt(0).toUpperCase() + readable.slice(1) : 'Unknown', tone: 'outline' }
}

export function incidentActionLabel(action: string): { label: string; tone: AdminTone } {
  if (action === 'held') return { label: 'Held (423)', tone: 'rose' }
  if (action === 'slowed') return { label: 'Slowed down', tone: 'orange' }
  if (action === 'end_user_blocked') return { label: 'End user blocked', tone: 'orange' }
  return { label: 'Alert only', tone: 'neutral' }
}

export function previousMonth(today: Date = new Date()): string {
  const year = today.getUTCFullYear()
  const month = today.getUTCMonth()
  const prev = new Date(Date.UTC(year, month - 1, 1))
  return `${prev.getUTCFullYear()}-${String(prev.getUTCMonth() + 1).padStart(2, '0')}`
}

export function recentMonths(count: number, today: Date = new Date()): string[] {
  const months: string[] = []
  for (let i = 0; i < count; i += 1) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - i, 1))
    months.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`)
  }
  return months
}
