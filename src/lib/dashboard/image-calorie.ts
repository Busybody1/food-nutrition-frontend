import type { ImageCalorieAccess, ImageCalorieMeter } from '@/lib/api/image-calorie'

export const IMAGE_CALORIE_PATH = '/dashboard/image-to-calorie'

export type CodeLanguage = 'curl' | 'javascript' | 'python'

export interface LimitCard {
  key: string
  label: string
  value: string
  hint: string
  percent: number | null
}

export interface ErrorRow {
  status: number
  code: string | null
  meaning: string
}

export function showImageCalorieNav(access: Pick<ImageCalorieAccess, 'available'> | null | undefined): boolean {
  return Boolean(access?.available)
}

export function accessNavItems<T extends { href: string }>(items: T[], available: boolean, photoItem: T): T[] {
  const visible = items.filter((item) => item.href !== photoItem.href)
  return available ? [...visible, photoItem] : visible
}

export function meterLabel(meter: ImageCalorieMeter | null): string {
  if (meter === 'pilot') return 'Photo test'
  if (meter === 'credits') return 'Credits'
  if (meter === 'mcp') return 'MCP allowance'
  if (meter === 'enterprise') return 'Enterprise'
  return 'Not available'
}

export function apiKeysHref(access: Pick<ImageCalorieAccess, 'key_product'>): string {
  return `/dashboard/api-keys?product=${access.key_product === 'mcp' ? 'mcp' : 'rest'}`
}

function utcDay(iso: string | null | undefined, withYear: boolean): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return ''
  const date = new Date(`${iso.slice(0, 10)}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(withYear ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  })
}

function n(value: number): string {
  return (Number.isFinite(value) && value > 0 ? Math.floor(value) : 0).toLocaleString('en-US')
}

export function centsText(cents: number): string {
  const safe = Number.isFinite(cents) && cents > 0 ? Math.round(cents) : 0
  return safe % 100 === 0 ? `$${(safe / 100).toLocaleString('en-US')}` : `$${(safe / 100).toFixed(2)}`
}

function percentOf(used: number, cap: number | null): number | null {
  if (cap === null || !Number.isFinite(cap) || cap <= 0) return null
  return Math.min(100, Math.max(0, (used / cap) * 100))
}

function ofCap(used: number, cap: number | null): string {
  return cap === null ? n(used) : `${n(used)} of ${n(cap)}`
}

export function formatUploadLimit(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  if (!Number.isFinite(mb) || mb <= 0) return '5 MB'
  return `${Number.isInteger(mb) ? mb : mb.toFixed(1)} MB`
}

export function limitCards(access: ImageCalorieAccess): LimitCard[] {
  if (access.meter === 'pilot' && access.pilot) {
    const p = access.pilot
    const resets = utcDay(p.resets_on, false)
    const ends = utcDay(p.ends_on, true)
    return [
      {
        key: 'month',
        label: 'Used this month',
        value: ofCap(p.used_this_month, p.monthly_cap),
        hint: resets ? `Resets ${resets}` : 'Resets on the 1st',
        percent: percentOf(p.used_this_month, p.monthly_cap),
      },
      {
        key: 'today',
        label: 'Used today',
        value: ofCap(p.used_today, p.daily_cap),
        hint: 'Resets at 00:00 UTC',
        percent: percentOf(p.used_today, p.daily_cap),
      },
      {
        key: 'ends',
        label: 'Photo test ends',
        value: ends || 'Not set',
        hint: 'Free of charge until then',
        percent: null,
      },
    ]
  }
  if (access.meter === 'credits' && access.credits) {
    const c = access.credits
    return [
      { key: 'balance', label: 'Credit balance', value: n(c.balance), hint: 'Shared by all photo calls', percent: null },
      {
        key: 'cost',
        label: 'Cost per photo',
        value: `${n(c.cost_per_call)} ${c.cost_per_call === 1 ? 'credit' : 'credits'}`,
        hint: 'Charged only when an estimate is returned',
        percent: null,
      },
      { key: 'left', label: 'Photos left', value: n(c.calls_left), hint: 'At the current balance', percent: null },
    ]
  }
  if (access.meter === 'enterprise' && access.enterprise) {
    const e = access.enterprise
    const resets = utcDay(e.resets_on, false)
    return [
      {
        key: 'month',
        label: 'Photos this month',
        value: ofCap(e.photos_used, e.photos_included),
        hint: resets ? `Included in your plan. Resets ${resets}` : 'Included in your plan',
        percent: percentOf(e.photos_used, e.photos_included),
      },
      {
        key: 'extra',
        label: 'Extra photos',
        value: n(e.photos_extra),
        hint: `${centsText(e.per_extra_photo_cents)} each on this month's bill`,
        percent: null,
      },
      {
        key: 'cap',
        label: 'Safety limit',
        value: n(e.photo_monthly_cap),
        hint: 'Photo calls return 429 past this. Ask us to raise it',
        percent: percentOf(e.photos_used, e.photo_monthly_cap),
      },
    ]
  }
  if (access.meter === 'mcp' && access.mcp) {
    const m = access.mcp
    if (m.trial) {
      return [
        {
          key: 'trial',
          label: 'Trial photos',
          value: ofCap(m.used_this_month, m.monthly_cap),
          hint: 'Shared with the MCP photo tool',
          percent: percentOf(m.used_this_month, m.monthly_cap),
        },
      ]
    }
    return [
      {
        key: 'month',
        label: 'Photos this month',
        value: ofCap(m.used_this_month, m.monthly_cap),
        hint: 'Shared with the MCP photo tool',
        percent: percentOf(m.used_this_month, m.monthly_cap),
      },
      {
        key: 'today',
        label: 'Photos today',
        value: ofCap(m.used_today, m.daily_cap),
        hint: 'Resets at 00:00 UTC',
        percent: percentOf(m.used_today, m.daily_cap),
      },
    ]
  }
  return []
}

export function usageMissing(access: ImageCalorieAccess): boolean {
  return access.available && limitCards(access).length === 0
}

export function endpointUrl(baseUrl: string, endpoint: string): string {
  return `${baseUrl.replace(/\/+$/, '')}${endpoint}`
}

export function codeSamples(url: string, fileField = 'file', endUserHeader?: string): Record<CodeLanguage, string> {
  const jsHeaders = endUserHeader
    ? `{ 'X-API-Key': process.env.CALORIE_API_KEY, '${endUserHeader}': userId }`
    : `{ 'X-API-Key': process.env.CALORIE_API_KEY }`
  const pyHeaders = endUserHeader
    ? `{"X-API-Key": os.environ["CALORIE_API_KEY"], "${endUserHeader}": user_id}`
    : `{"X-API-Key": os.environ["CALORIE_API_KEY"]}`
  return {
    curl: [
      `curl -X POST "${url}" \\`,
      `  -H "X-API-Key: $CALORIE_API_KEY" \\`,
      ...(endUserHeader ? [`  -H "${endUserHeader}: user_8f3a2c91" \\`] : []),
      `  -F "${fileField}=@lunch.jpg"`,
    ].join('\n'),
    javascript: [
      `const form = new FormData()`,
      `form.append('${fileField}', photoFile)`,
      ``,
      `const res = await fetch('${url}', {`,
      `  method: 'POST',`,
      `  headers: ${jsHeaders},`,
      `  body: form,`,
      `})`,
      `const data = await res.json()`,
      `console.log(data.estimate.calories)`,
    ].join('\n'),
    python: [
      `import os`,
      `import requests`,
      ``,
      `with open("lunch.jpg", "rb") as photo:`,
      `    res = requests.post(`,
      `        "${url}",`,
      `        headers=${pyHeaders},`,
      `        files={"${fileField}": ("lunch.jpg", photo, "image/jpeg")},`,
      `        timeout=60,`,
      `    )`,
      `res.raise_for_status()`,
      `print(res.json()["estimate"]["calories"])`,
    ].join('\n'),
  }
}

const EXAMPLE_ESTIMATE = {
  food_name: 'grilled chicken breast',
  calories: 198.0,
  protein_g: 37.2,
  carbs_g: 0.0,
  fat_g: 4.8,
  confidence: 0.91,
  serving_grams: 120.0,
  items: [
    {
      food_name: 'grilled chicken breast',
      estimated_grams: 120.0,
      calories: 198.0,
      protein_g: 37.2,
      carbs_g: 0.0,
      fat_g: 4.8,
      confidence: 0.91,
      db_matched: true,
      is_low_confidence: false,
    },
  ],
}

export function exampleResponse(access: ImageCalorieAccess): string {
  const requestId = '0d6c0f0e-3f0b-4d4e-9d3e-2f1a7c1b9a10'
  if (access.meter === 'pilot') {
    const p = access.pilot
    const monthlyCap = p?.monthly_cap || 100
    const dailyCap = p?.daily_cap || 20
    return JSON.stringify(
      {
        request_id: requestId,
        calls_used: 13,
        calls_remaining: Math.max(0, monthlyCap - 13),
        monthly_cap: monthlyCap,
        calls_used_today: 3,
        daily_cap: dailyCap,
        resets_on: p?.resets_on || '2026-12-01',
        estimate: EXAMPLE_ESTIMATE,
      },
      null,
      2
    )
  }
  if (access.meter === 'enterprise') {
    const e = access.enterprise
    return JSON.stringify(
      {
        request_id: requestId,
        photos_used: 13,
        photos_included: e?.photos_included || 5000,
        photos_extra: 0,
        photo_monthly_cap: e?.photo_monthly_cap || 25000,
        resets_on: e?.resets_on || '2026-12-01',
        estimate: EXAMPLE_ESTIMATE,
      },
      null,
      2
    )
  }
  if (access.meter === 'credits') {
    const cost = access.credits?.cost_per_call || 1
    return JSON.stringify(
      {
        request_id: requestId,
        credits_charged: cost,
        credits_remaining: Math.max(0, (access.credits?.balance ?? 10) - cost),
        estimate: EXAMPLE_ESTIMATE,
      },
      null,
      2
    )
  }
  return JSON.stringify({ request_id: requestId, estimate: EXAMPLE_ESTIMATE }, null, 2)
}

export function responseNotes(access: ImageCalorieAccess): string[] {
  const notes = [
    'estimate holds the totals for the whole plate.',
    'estimate.items lists each food found, with its own grams and macros.',
  ]
  if (access.meter === 'pilot') {
    notes.push('calls_used includes the call you just made. resets_on is when it goes back to 0.')
  } else if (access.meter === 'credits') {
    notes.push('credits_remaining is your balance after this call.')
  } else if (access.meter === 'enterprise') {
    notes.push('photos_used includes the call you just made. photos_extra is how many are past the included photos this month.')
  }
  return notes
}

export function listWithOr(items: string[]): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} or ${items[items.length - 1]}`
}

export function countingRules(access: ImageCalorieAccess): string[] {
  const size = formatUploadLimit(access.max_upload_bytes)
  const formats = listWithOr(access.formats)
  const rules = [`Send one ${formats} image of up to ${size} in the ${access.file_field} field.`]
  if (access.meter === 'pilot') {
    rules.push('Only calls that return an estimate count toward your limits.')
    rules.push('A bad file (400), a file over the size limit (413) or a failed analysis (502) is not counted.')
    rules.push('At most 60 calls a day may reach the analysis step, counted whether they succeed or not.')
    rules.push('Photo calls do not use your plan’s monthly request allowance.')
  } else if (access.meter === 'credits') {
    rules.push('Credits are charged only when an estimate is returned. Failed calls (400, 413, 502) are free.')
    rules.push('When the balance runs out, calls return 402 until credits are added.')
  } else if (access.meter === 'enterprise') {
    const e = access.enterprise
    rules.push(
      `${n(e?.photos_included ?? 5000)} photos a month are included. Each photo after that is ${centsText(e?.per_extra_photo_cents ?? 1)}, added to the month's bill.`
    )
    rules.push('Only calls that return an estimate count. A bad file (400), a file over the size limit (413) or a failed analysis (502) is free.')
    rules.push(`Past the safety limit of ${n(e?.photo_monthly_cap ?? 25000)} photos a month, calls return 429 until the 1st or until we raise it.`)
    rules.push('Send X-End-User-Id on photo calls too. Photos count toward that user.')
  } else if (access.meter === 'mcp') {
    rules.push('Calls here and photo calls from your MCP client draw from the same allowance.')
    rules.push('Only calls that return an estimate count toward the allowance.')
    rules.push('Your MCP key works for this endpoint. Other REST endpoints stay closed on the MCP plan.')
  }
  rules.push('Your plan’s per-minute rate limit still applies.')
  return rules
}

export function errorRows(meter: ImageCalorieMeter | null): ErrorRow[] {
  const rows: ErrorRow[] = [
    { status: 400, code: 'invalid_image', meaning: 'Not a JPEG, PNG or WebP image' },
    { status: 401, code: null, meaning: 'Missing or invalid API key' },
    { status: 403, code: 'image_calorie_user_required', meaning: 'Called with a dashboard login, not an API key' },
    { status: 403, code: 'image_calorie_plan_required', meaning: 'Photo access is off or has ended' },
    { status: 413, code: 'image_too_large', meaning: 'The file is over the size limit' },
  ]
  if (meter === 'pilot') {
    rows.push(
      { status: 429, code: 'image_calorie_pilot_monthly_cap', meaning: 'Monthly limit reached. See resets_on' },
      { status: 429, code: 'image_calorie_pilot_daily_cap', meaning: 'Daily limit reached. See resets_at' },
      { status: 429, code: 'image_calorie_pilot_attempt_limit', meaning: 'Too many failed calls today' }
    )
  } else if (meter === 'credits') {
    rows.push({ status: 402, code: 'insufficient_credits', meaning: 'Not enough credits for this call' })
  } else if (meter === 'mcp') {
    rows.push({ status: 429, code: 'image_calorie_mcp_photo_limit', meaning: 'MCP photo allowance reached' })
  } else if (meter === 'enterprise') {
    rows.push(
      { status: 429, code: 'image_calorie_monthly_cap', meaning: 'Monthly photo safety limit reached. See resets_on' },
      { status: 429, code: 'image_calorie_attempt_limit', meaning: 'Too many failed photo calls this month' }
    )
  }
  rows.push(
    { status: 429, code: null, meaning: 'Per-minute rate limit. Retry after a minute' },
    { status: 502, code: 'vision_provider_error', meaning: 'The analysis failed or found no food' }
  )
  return rows
}
