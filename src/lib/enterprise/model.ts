export interface EnterpriseTier {
  label: string
  max_users: number
  monthly_price_cents: number
  included_calls: number
  included_photos: number
}

export interface EnterpriseAboveTop {
  starts_after_users: number
  base_price_cents: number
  per_extra_user_cents: number
  calls_per_extra_user: number
}

export interface EnterprisePricing {
  tiers: EnterpriseTier[]
  above_top: EnterpriseAboveTop
  per_1k_extra_calls_cents: number
  per_extra_photo_cents: number
  photos_included: number
  photo_monthly_cap: number
  rate_limit_per_minute: number | null
  end_user_header: string
}

export const END_USER_HEADER = 'X-End-User-Id'

export const DEFAULT_ENTERPRISE_PRICING: EnterprisePricing = {
  tiers: [
    {
      label: 'Up to 2,000 users',
      max_users: 2000,
      monthly_price_cents: 15000,
      included_calls: 1_000_000,
      included_photos: 5000,
    },
    {
      label: '2,001 to 5,000 users',
      max_users: 5000,
      monthly_price_cents: 30000,
      included_calls: 2_500_000,
      included_photos: 5000,
    },
    {
      label: '5,001 to 10,000 users',
      max_users: 10000,
      monthly_price_cents: 50000,
      included_calls: 5_000_000,
      included_photos: 5000,
    },
  ],
  above_top: {
    starts_after_users: 10000,
    base_price_cents: 50000,
    per_extra_user_cents: 4,
    calls_per_extra_user: 500,
  },
  per_1k_extra_calls_cents: 15,
  per_extra_photo_cents: 1,
  photos_included: 5000,
  photo_monthly_cap: 25000,
  rate_limit_per_minute: 500,
  end_user_header: END_USER_HEADER,
}

type Json = Record<string, unknown>

function isObject(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function whole(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null
}

function wholeOr(value: unknown, fallback: number): number {
  const n = whole(value)
  return n === null ? fallback : n
}

function normalizeTier(raw: unknown): EnterpriseTier | null {
  if (!isObject(raw)) return null
  const maxUsers = whole(raw.max_users)
  const price = whole(raw.monthly_price_cents)
  const calls = whole(raw.included_calls)
  if (maxUsers === null || maxUsers <= 0 || price === null || calls === null) return null
  const label = typeof raw.label === 'string' && raw.label.trim() ? raw.label.trim() : `Up to ${formatCount(maxUsers)} users`
  return {
    label,
    max_users: maxUsers,
    monthly_price_cents: price,
    included_calls: calls,
    included_photos: wholeOr(raw.included_photos, DEFAULT_ENTERPRISE_PRICING.photos_included),
  }
}

export function normalizeEnterprisePricing(raw: unknown): EnterprisePricing {
  if (!isObject(raw)) return DEFAULT_ENTERPRISE_PRICING
  const tiers = Array.isArray(raw.tiers)
    ? raw.tiers.map(normalizeTier).filter((tier): tier is EnterpriseTier => tier !== null)
    : []
  if (tiers.length === 0) return DEFAULT_ENTERPRISE_PRICING
  tiers.sort((a, b) => a.max_users - b.max_users)
  const top = tiers[tiers.length - 1]
  const above = isObject(raw.above_top) ? raw.above_top : {}
  const fallback = DEFAULT_ENTERPRISE_PRICING
  const rate = whole(raw.rate_limit_per_minute)
  return {
    tiers,
    above_top: {
      starts_after_users: wholeOr(above.starts_after_users, top.max_users),
      base_price_cents: wholeOr(above.base_price_cents, top.monthly_price_cents),
      per_extra_user_cents: wholeOr(above.per_extra_user_cents, fallback.above_top.per_extra_user_cents),
      calls_per_extra_user: wholeOr(above.calls_per_extra_user, fallback.above_top.calls_per_extra_user),
    },
    per_1k_extra_calls_cents: wholeOr(raw.per_1k_extra_calls_cents, fallback.per_1k_extra_calls_cents),
    per_extra_photo_cents: wholeOr(raw.per_extra_photo_cents, fallback.per_extra_photo_cents),
    photos_included: wholeOr(raw.photos_included, fallback.photos_included),
    photo_monthly_cap: wholeOr(raw.photo_monthly_cap, fallback.photo_monthly_cap),
    rate_limit_per_minute: rate !== null && rate > 0 ? rate : null,
    end_user_header:
      typeof raw.end_user_header === 'string' && raw.end_user_header.trim()
        ? raw.end_user_header.trim()
        : END_USER_HEADER,
  }
}

export function formatCount(value: number): string {
  return (Number.isFinite(value) ? Math.floor(value) : 0).toLocaleString('en-US')
}

export function formatCents(cents: number): string {
  const safe = Number.isFinite(cents) ? Math.round(cents) : 0
  const dollars = safe / 100
  if (safe % 100 === 0) return `$${dollars.toLocaleString('en-US')}`
  if (Math.abs(safe) < 100) {
    const text = dollars.toFixed(2)
    return `$${text}`
  }
  return `$${dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatCallsShort(calls: number): string {
  if (calls >= 1_000_000) {
    const millions = calls / 1_000_000
    return `${Number.isInteger(millions) ? millions : millions.toFixed(1)}M`
  }
  if (calls >= 1000) {
    const thousands = calls / 1000
    return `${Number.isInteger(thousands) ? thousands : thousands.toFixed(1)}K`
  }
  return formatCount(calls)
}

export function startingPriceCents(pricing: EnterprisePricing): number {
  return pricing.tiers.reduce(
    (low, tier) => Math.min(low, tier.monthly_price_cents),
    Number.POSITIVE_INFINITY
  )
}

export function fromPriceLabel(pricing: EnterprisePricing): string {
  const low = startingPriceCents(pricing)
  return Number.isFinite(low) ? `From ${formatCents(low)}` : 'Custom'
}

export interface TierTableRow {
  users: string
  price: string
  calls: string
  photos: string
}

export function tierTableRows(pricing: EnterprisePricing): TierTableRow[] {
  const rows = pricing.tiers.map((tier) => ({
    users: tier.label,
    price: `${formatCents(tier.monthly_price_cents)}/mo`,
    calls: `${formatCallsShort(tier.included_calls)} calls`,
    photos: `${formatCount(tier.included_photos)} photos`,
  }))
  const above = pricing.above_top
  rows.push({
    users: `Over ${formatCount(above.starts_after_users)} users`,
    price: `${formatCents(above.base_price_cents)} + ${formatCents(above.per_extra_user_cents)}/user`,
    calls: `+${formatCount(above.calls_per_extra_user)} calls per user`,
    photos: `${formatCount(pricing.photos_included)} photos`,
  })
  return rows
}

export function overageLines(pricing: EnterprisePricing): string[] {
  const above = pricing.above_top
  const lines = [
    `Over ${formatCount(above.starts_after_users)} users: ${formatCents(above.per_extra_user_cents)} per extra user, each adding ${formatCount(above.calls_per_extra_user)} calls.`,
    `Extra calls past the top allowance: ${formatCents(pricing.per_1k_extra_calls_cents)} per 1,000.`,
    `${formatCount(pricing.photos_included)} photo scans a month included, then ${formatCents(pricing.per_extra_photo_cents)} per photo.`,
  ]
  if (pricing.rate_limit_per_minute) {
    lines.push(`Up to ${formatCount(pricing.rate_limit_per_minute)} calls a minute.`)
  }
  lines.push('More users or calls than your tier moves that month up a tier. Nothing stops at month end.')
  return lines
}

export function enterpriseHighlights(pricing: EnterprisePricing): string[] {
  const first = pricing.tiers[0]
  const last = pricing.tiers[pricing.tiers.length - 1]
  const items = [
    `Priced by monthly users, ${fromPriceLabel(pricing).toLowerCase()}`,
    first && last
      ? `${formatCallsShort(first.included_calls)} to ${formatCallsShort(last.included_calls)} calls a month included`
      : 'Monthly calls included',
    `${formatCount(pricing.photos_included)} photo scans a month`,
  ]
  if (pricing.rate_limit_per_minute) items.push(`${formatCount(pricing.rate_limit_per_minute)} calls a minute`)
  items.push('Commercial production use')
  items.push('100 API keys and 10 team members')
  return items
}

export type EndUserMode = 'off' | 'warn' | 'required'
export type StatementStatus = 'final' | 'invoiced' | 'paid' | 'void'

export interface EnterpriseStatementMath {
  users: number
  calls: number
  photos: number
  tier_label: string
  tier_sort_order: number | null
  tier_basis: 'users' | 'calls'
  users_limit: number | null
  calls_included: number
  photos_included: number
  extra_users: number
  extra_calls: number
  extra_photos: number
  user_fee_cents: number
  call_fee_cents: number
  photo_fee_cents: number
  total_cents: number
}

export interface EnterpriseHeaderCoverage {
  calls_with_id: number
  calls_missing_id: number
  calls_invalid_id: number
  share_with_id: number | null
}

export interface EnterpriseNextTier {
  label: string
  monthly_price_cents: number | null
  starts_after_users: number | null
  starts_after_calls: number | null
}

export interface EnterpriseTopEndUser {
  end_user: string
  calls: number
  photo_calls: number
  active_days: number
  first_seen_at: string | null
  last_seen_at: string | null
}

export interface EnterpriseMonth {
  account_user_id: number
  month: string
  period_start: string
  period_end: string
  as_of: string | null
  users: number
  calls: number
  photos: number
  header: EnterpriseHeaderCoverage
  heavy_end_users: number
  statement: EnterpriseStatementMath
  next_tier: EnterpriseNextTier | null
  photo_monthly_cap: number
  top_end_users: EnterpriseTopEndUser[]
}

export interface EnterpriseStatementRow {
  account_user_id: number
  month: string
  active_users: number
  calls: number
  photos: number
  tier_label: string | null
  user_fee_cents: number
  call_fee_cents: number
  photo_fee_cents: number
  total_cents: number
  status: StatementStatus
  closed_at: string | null
  invoiced_at: string | null
  paid_at: string | null
  email?: string | null
  detail?: Record<string, unknown>
}

export interface EnterpriseAccountView {
  enabled: boolean
  billing_enabled: boolean
  end_user_tracking_enabled: boolean
  role: 'owner' | 'member'
  end_user_mode: EndUserMode
  end_user_records_allowed: boolean
  started_on: string | null
  pricing: EnterprisePricing
  month: EnterpriseMonth | null
  end_user_header: string
}

export const NO_ENTERPRISE: EnterpriseAccountView = {
  enabled: false,
  billing_enabled: false,
  end_user_tracking_enabled: false,
  role: 'owner',
  end_user_mode: 'off',
  end_user_records_allowed: false,
  started_on: null,
  pricing: normalizeEnterprisePricing(null),
  month: null,
  end_user_header: END_USER_HEADER,
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

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null
}

export function endUserModeOf(value: unknown): EndUserMode {
  return value === 'warn' || value === 'required' ? value : 'off'
}

export function statementStatusOf(value: unknown): StatementStatus {
  return value === 'invoiced' || value === 'paid' || value === 'void' ? value : 'final'
}

export function normalizeStatementMath(raw: unknown): EnterpriseStatementMath {
  const s = isObject(raw) ? raw : {}
  return {
    users: count(s.users),
    calls: count(s.calls),
    photos: count(s.photos),
    tier_label: text(s.tier_label) ?? 'Up to 2,000 users',
    tier_sort_order: optionalCount(s.tier_sort_order),
    tier_basis: s.tier_basis === 'calls' ? 'calls' : 'users',
    users_limit: optionalCount(s.users_limit),
    calls_included: count(s.calls_included),
    photos_included: count(s.photos_included),
    extra_users: count(s.extra_users),
    extra_calls: count(s.extra_calls),
    extra_photos: count(s.extra_photos),
    user_fee_cents: count(s.user_fee_cents),
    call_fee_cents: count(s.call_fee_cents),
    photo_fee_cents: count(s.photo_fee_cents),
    total_cents: count(s.total_cents),
  }
}

function normalizeHeader(raw: unknown): EnterpriseHeaderCoverage {
  const h = isObject(raw) ? raw : {}
  const share = typeof h.share_with_id === 'number' && Number.isFinite(h.share_with_id) ? h.share_with_id : null
  return {
    calls_with_id: count(h.calls_with_id),
    calls_missing_id: count(h.calls_missing_id),
    calls_invalid_id: count(h.calls_invalid_id),
    share_with_id: share === null ? null : Math.min(1, Math.max(0, share)),
  }
}

function normalizeNextTier(raw: unknown): EnterpriseNextTier | null {
  if (!isObject(raw)) return null
  const label = text(raw.label)
  if (!label) return null
  return {
    label,
    monthly_price_cents: optionalCount(raw.monthly_price_cents),
    starts_after_users: optionalCount(raw.starts_after_users),
    starts_after_calls: optionalCount(raw.starts_after_calls),
  }
}

function normalizeTopUser(raw: unknown): EnterpriseTopEndUser | null {
  if (!isObject(raw)) return null
  const id = text(raw.end_user)
  if (!id) return null
  return {
    end_user: id,
    calls: count(raw.calls),
    photo_calls: count(raw.photo_calls),
    active_days: count(raw.active_days),
    first_seen_at: text(raw.first_seen_at),
    last_seen_at: text(raw.last_seen_at),
  }
}

export function normalizeEnterpriseMonth(raw: unknown): EnterpriseMonth | null {
  if (!isObject(raw)) return null
  const month = text(raw.month)
  if (!month) return null
  return {
    account_user_id: count(raw.account_user_id),
    month,
    period_start: text(raw.period_start) ?? '',
    period_end: text(raw.period_end) ?? '',
    as_of: text(raw.as_of),
    users: count(raw.users),
    calls: count(raw.calls),
    photos: count(raw.photos),
    header: normalizeHeader(raw.header),
    heavy_end_users: count(raw.heavy_end_users),
    statement: normalizeStatementMath(raw.statement),
    next_tier: normalizeNextTier(raw.next_tier),
    photo_monthly_cap: count(raw.photo_monthly_cap),
    top_end_users: Array.isArray(raw.top_end_users)
      ? raw.top_end_users.map(normalizeTopUser).filter((u): u is EnterpriseTopEndUser => u !== null)
      : [],
  }
}

export function normalizeEnterpriseView(raw: unknown): EnterpriseAccountView {
  if (!isObject(raw) || raw.enabled !== true) return NO_ENTERPRISE
  const config = isObject(raw.config) ? raw.config : {}
  return {
    enabled: true,
    billing_enabled: raw.billing_enabled === true,
    end_user_tracking_enabled: raw.end_user_tracking_enabled === true,
    role: raw.role === 'member' ? 'member' : 'owner',
    end_user_mode: endUserModeOf(config.end_user_mode),
    end_user_records_allowed: config.end_user_records_allowed === true,
    started_on: text(config.started_on),
    pricing: normalizeEnterprisePricing(raw.pricing),
    month: normalizeEnterpriseMonth(raw.month),
    end_user_header: text(raw.end_user_header) ?? END_USER_HEADER,
  }
}

export function normalizeStatementRow(raw: unknown): EnterpriseStatementRow | null {
  if (!isObject(raw)) return null
  const month = text(raw.month)
  if (!month) return null
  return {
    account_user_id: count(raw.account_user_id),
    month,
    active_users: count(raw.active_users),
    calls: count(raw.calls),
    photos: count(raw.photos),
    tier_label: text(raw.tier_label),
    user_fee_cents: count(raw.user_fee_cents),
    call_fee_cents: count(raw.call_fee_cents),
    photo_fee_cents: count(raw.photo_fee_cents),
    total_cents: count(raw.total_cents),
    status: statementStatusOf(raw.status),
    closed_at: text(raw.closed_at),
    invoiced_at: text(raw.invoiced_at),
    paid_at: text(raw.paid_at),
    email: text(raw.email),
    ...(isObject(raw.detail) ? { detail: raw.detail } : {}),
  }
}

export function normalizeStatementList(raw: unknown): EnterpriseStatementRow[] {
  const list = isObject(raw) && Array.isArray(raw.statements) ? raw.statements : []
  return list.map(normalizeStatementRow).filter((row): row is EnterpriseStatementRow => row !== null)
}

const VIEW_PATH = '/api/v1/users/enterprise'
const STATEMENTS_PATH = '/api/v1/users/enterprise/statements'

export interface EnterpriseHttpClient {
  get<T>(endpoint: string, params?: Record<string, unknown>): Promise<{ data: T }>
}

export function createEnterpriseApi(client: EnterpriseHttpClient) {
  return {
    async view(): Promise<EnterpriseAccountView> {
      const res = await client.get<unknown>(VIEW_PATH)
      return normalizeEnterpriseView(res.data)
    },
    async statements(): Promise<EnterpriseStatementRow[]> {
      const res = await client.get<unknown>(STATEMENTS_PATH)
      return normalizeStatementList(res.data)
    },
  }
}

export const ENTERPRISE_PATH = '/dashboard/enterprise'
export const END_USER_RATE_LIMIT_PER_MINUTE = 60

export type EnterpriseTone = 'neutral' | 'green' | 'orange' | 'rose' | 'brand' | 'indigo'

export interface EnterpriseCard {
  key: 'users' | 'calls' | 'photos' | 'bill'
  label: string
  value: string
  hint: string
  percent: number | null
}

export interface EnterpriseErrorRow {
  status: number
  code: string
  meaning: string
}

export function showEnterpriseNav(view: Pick<EnterpriseAccountView, 'enabled'> | null | undefined): boolean {
  return Boolean(view?.enabled)
}

export function enterpriseNavItems<T extends { href: string }>(items: T[], enabled: boolean, enterpriseItem: T): T[] {
  const visible = items.filter((item) => item.href !== enterpriseItem.href)
  return enabled ? [...visible, enterpriseItem] : visible
}

function percentOf(used: number, cap: number | null): number | null {
  if (cap === null || !Number.isFinite(cap) || cap <= 0) return null
  return Math.min(100, Math.max(0, (used / cap) * 100))
}

export function monthLabel(month: string): string {
  if (!/^\d{4}-\d{2}$/.test(month)) return month
  const date = new Date(`${month}-01T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return month
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

export function usageCards(month: EnterpriseMonth, pricing: EnterprisePricing): EnterpriseCard[] {
  const s = month.statement
  const aboveTop = s.tier_sort_order === null
  const usersLimit = s.users_limit
  const cap = month.photo_monthly_cap || pricing.photo_monthly_cap
  return [
    {
      key: 'users',
      label: 'Users this month',
      value: usersLimit ? `${formatCount(month.users)} of ${formatCount(usersLimit)}` : formatCount(month.users),
      hint: aboveTop
        ? `${formatCount(s.extra_users)} over ${formatCount(pricing.above_top.starts_after_users)} at ${formatCents(pricing.above_top.per_extra_user_cents)} each`
        : 'Different end-user IDs with a successful call',
      percent: percentOf(month.users, usersLimit),
    },
    {
      key: 'calls',
      label: 'Calls this month',
      value: `${formatCount(month.calls)} of ${formatCallsShort(s.calls_included)}`,
      hint: s.extra_calls > 0
        ? `${formatCount(s.extra_calls)} extra at ${formatCents(pricing.per_1k_extra_calls_cents)} per 1,000`
        : 'Search, barcode and food lookups. Photos are counted apart',
      percent: percentOf(month.calls, s.calls_included),
    },
    {
      key: 'photos',
      label: 'Photo scans',
      value: `${formatCount(month.photos)} of ${formatCount(s.photos_included)}`,
      hint: s.extra_photos > 0
        ? `${formatCount(s.extra_photos)} extra at ${formatCents(pricing.per_extra_photo_cents)} each. Safety limit ${formatCount(cap)}`
        : `Then ${formatCents(pricing.per_extra_photo_cents)} each. Safety limit ${formatCount(cap)}`,
      percent: percentOf(month.photos, s.photos_included),
    },
    {
      key: 'bill',
      label: 'Bill so far',
      value: formatCents(s.total_cents),
      hint: s.tier_basis === 'calls' ? `${s.tier_label}, moved up on calls` : s.tier_label,
      percent: null,
    },
  ]
}

export function billLines(statement: EnterpriseStatementMath): { label: string; value: string }[] {
  const lines = [{ label: statement.tier_label, value: formatCents(statement.user_fee_cents) }]
  if (statement.call_fee_cents > 0) {
    lines.push({ label: `${formatCount(statement.extra_calls)} extra calls`, value: formatCents(statement.call_fee_cents) })
  }
  if (statement.photo_fee_cents > 0) {
    lines.push({ label: `${formatCount(statement.extra_photos)} extra photos`, value: formatCents(statement.photo_fee_cents) })
  }
  lines.push({ label: 'Total', value: formatCents(statement.total_cents) })
  return lines
}

export function nextTierText(month: EnterpriseMonth): string | null {
  const next = month.next_tier
  if (!next) return null
  const parts: string[] = []
  if (next.starts_after_users) parts.push(`more than ${formatCount(next.starts_after_users)} users`)
  if (next.starts_after_calls) parts.push(`more than ${formatCount(next.starts_after_calls)} calls`)
  const price = next.monthly_price_cents ? ` (${formatCents(next.monthly_price_cents)}/mo)` : ''
  if (parts.length === 0) return `Next tier: ${next.label}${price}.`
  return `Next tier: ${next.label}${price}, after ${parts.join(' or ')} this month.`
}

export function headerCoverageText(header: EnterpriseHeaderCoverage, headerName: string = END_USER_HEADER): string | null {
  const total = header.calls_with_id + header.calls_missing_id + header.calls_invalid_id
  if (total === 0 || header.share_with_id === null) return null
  const pct = Math.round(header.share_with_id * 100)
  const missing = header.calls_missing_id + header.calls_invalid_id
  if (missing === 0) return `Every call this month sent ${headerName}.`
  return `${pct}% of calls this month sent a valid ${headerName}. ${formatCount(missing)} did not.`
}

export function modeText(mode: EndUserMode, headerName: string = END_USER_HEADER): string {
  if (mode === 'required') return `Required. Calls without a valid ${headerName} get 400.`
  if (mode === 'warn') return `Integration period. Calls without ${headerName} still work and are counted below.`
  return 'Not checked on this account.'
}

export function endUserHeaderRules(headerName: string = END_USER_HEADER): string[] {
  return [
    `Send ${headerName} on every call with an anonymous ID for the person using your app.`,
    'Use any stable ID from your own system, 8 to 64 characters from A-Z, a-z, 0-9 and . _ : -',
    'Never send an email, name or phone number. We keep only a scrambled version of the ID.',
    'The same person should send the same ID every time. One ID per person, not per device or session.',
    `Each ID can make up to ${END_USER_RATE_LIMIT_PER_MINUTE} calls a minute. Your other users are not affected.`,
    'A user counts toward the month once they make one successful call.',
  ]
}

export function endUserErrorRows(): EnterpriseErrorRow[] {
  return [
    { status: 400, code: 'end_user_id_required', meaning: 'Required mode and the header is missing' },
    { status: 400, code: 'end_user_id_invalid', meaning: 'Required mode and the ID breaks the format rules' },
    { status: 400, code: 'paging_limit', meaning: 'skip + limit goes past the first 1,000 results' },
    { status: 403, code: 'end_user_blocked', meaning: 'This end user is blocked until 00:00 UTC after unusual activity' },
    { status: 429, code: 'end_user_rate_limited', meaning: `This end user is over ${END_USER_RATE_LIMIT_PER_MINUTE} calls a minute. Retry after Retry-After` },
  ]
}

export function savedRecordRules(): string[] {
  return [
    'For a meal or saved food a user picked, you may keep the food ID, name, brand, serving, amount and the nutrition numbers shown for that entry, for as long as that user has an account with you.',
    'Only that user, and people they choose to share with, may see the entry.',
    'Do not pool entries into a shared food list, search or autocomplete. Do not export, resell or use them to train models. Do not store foods no user picked.',
    'Keep our food ID on every stored entry.',
    'When a user deletes their account, delete their entries.',
    'If you stop using Calorie API, past diary entries may stay visible to the user who logged them. Saved foods and anything used to log new meals must be removed within 30 days.',
    'Everything else, such as cached search results, keeps the 30-day cache limit.',
  ]
}

export function endUserCodeSample(url: string, headerName: string = END_USER_HEADER): string {
  return [
    `curl "${url}?q=greek%20yogurt" \\`,
    `  -H "X-API-Key: $CALORIE_API_KEY" \\`,
    `  -H "${headerName}: user_8f3a2c91"`,
  ].join('\n')
}

export function statementStatusLabel(status: StatementStatus): { label: string; tone: EnterpriseTone } {
  if (status === 'paid') return { label: 'Paid', tone: 'green' }
  if (status === 'invoiced') return { label: 'Invoiced', tone: 'indigo' }
  if (status === 'void') return { label: 'Void', tone: 'neutral' }
  return { label: 'Ready to invoice', tone: 'orange' }
}
