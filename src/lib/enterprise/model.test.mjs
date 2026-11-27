import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DEFAULT_ENTERPRISE_PRICING,
  ENTERPRISE_PATH,
  NO_ENTERPRISE,
  billLines,
  createEnterpriseApi,
  endUserCodeSample,
  endUserErrorRows,
  endUserHeaderRules,
  enterpriseHighlights,
  enterpriseNavItems,
  headerCoverageText,
  modeText,
  monthLabel,
  nextTierText,
  normalizeEnterpriseView,
  normalizeStatementList,
  savedRecordRules,
  showEnterpriseNav,
  statementStatusLabel,
  usageCards,
  formatCallsShort,
  formatCents,
  fromPriceLabel,
  normalizeEnterprisePricing,
  overageLines,
  tierTableRows,
} from './model.ts'

const apiPayload = {
  currency: 'usd',
  tiers: [
    { label: '5,001 to 10,000 users', max_users: 10000, monthly_price_cents: 50000, included_calls: 5000000, included_photos: 5000 },
    { label: 'Up to 2,000 users', max_users: 2000, monthly_price_cents: 15000, included_calls: 1000000, included_photos: 5000 },
    { label: '2,001 to 5,000 users', max_users: 5000, monthly_price_cents: 30000, included_calls: 2500000, included_photos: 5000 },
  ],
  above_top: { starts_after_users: 10000, base_price_cents: 50000, per_extra_user_cents: 4, calls_per_extra_user: 500 },
  per_1k_extra_calls_cents: 15,
  per_extra_photo_cents: 1,
  photos_included: 5000,
  photo_monthly_cap: 25000,
  rate_limit_per_minute: 500,
  end_user_header: 'X-End-User-Id',
}

test('cents format as plain dollars', () => {
  assert.equal(formatCents(15000), '$150')
  assert.equal(formatCents(4), '$0.04')
  assert.equal(formatCents(1), '$0.01')
  assert.equal(formatCents(15), '$0.15')
  assert.equal(formatCents(135000), '$1,350')
  assert.equal(formatCents(65050), '$650.50')
  assert.equal(formatCents(Number.NaN), '$0')
})

test('call counts shorten to K and M', () => {
  assert.equal(formatCallsShort(1000000), '1M')
  assert.equal(formatCallsShort(2500000), '2.5M')
  assert.equal(formatCallsShort(5000), '5K')
  assert.equal(formatCallsShort(500), '500')
})

test('the API payload normalizes and sorts tiers by users', () => {
  const pricing = normalizeEnterprisePricing(apiPayload)
  assert.deepEqual(
    pricing.tiers.map((t) => t.max_users),
    [2000, 5000, 10000]
  )
  assert.equal(pricing.rate_limit_per_minute, 500)
  assert.equal(pricing.above_top.per_extra_user_cents, 4)
})

test('junk payloads fall back to the default ladder', () => {
  assert.deepEqual(normalizeEnterprisePricing(null), DEFAULT_ENTERPRISE_PRICING)
  assert.deepEqual(normalizeEnterprisePricing({ tiers: [] }), DEFAULT_ENTERPRISE_PRICING)
  assert.deepEqual(normalizeEnterprisePricing({ tiers: [{ max_users: -1 }] }), DEFAULT_ENTERPRISE_PRICING)
})

test('the default ladder matches the backend DEFAULT_LADDER', () => {
  assert.deepEqual(
    DEFAULT_ENTERPRISE_PRICING.tiers.map((t) => [t.max_users, t.monthly_price_cents, t.included_calls]),
    [
      [2000, 15000, 1000000],
      [5000, 30000, 2500000],
      [10000, 50000, 5000000],
    ]
  )
})

test('the starting price reads From $150', () => {
  assert.equal(fromPriceLabel(normalizeEnterprisePricing(apiPayload)), 'From $150')
})

test('tier table adds an open row above the top tier', () => {
  const rows = tierTableRows(DEFAULT_ENTERPRISE_PRICING)
  assert.equal(rows.length, 4)
  assert.deepEqual(rows[0], {
    users: 'Up to 2,000 users',
    price: '$150/mo',
    calls: '1M calls',
    photos: '5,000 photos',
  })
  assert.deepEqual(rows[3], {
    users: 'Over 10,000 users',
    price: '$500 + $0.04/user',
    calls: '+500 calls per user',
    photos: '5,000 photos',
  })
})

test('overage lines carry every rate', () => {
  const lines = overageLines(DEFAULT_ENTERPRISE_PRICING).join(' ')
  assert.match(lines, /\$0\.04 per extra user/)
  assert.match(lines, /\$0\.15 per 1,000/)
  assert.match(lines, /\$0\.01 per photo/)
  assert.match(lines, /5,000 photo scans/)
  assert.match(lines, /500 calls a minute/)
})

test('highlights start from the starting price', () => {
  const items = enterpriseHighlights(DEFAULT_ENTERPRISE_PRICING)
  assert.equal(items[0], 'Priced by monthly users, from $150')
  assert.equal(items[1], '1M to 5M calls a month included')
})

const viewPayload = {
  enabled: true,
  billing_enabled: true,
  end_user_tracking_enabled: true,
  role: 'owner',
  config: { end_user_mode: 'warn', end_user_records_allowed: true, started_on: '2026-12-01' },
  pricing: { ...apiPayload, rate_limit_per_minute: undefined },
  month: {
    account_user_id: 42,
    month: '2026-12',
    period_start: '2026-12-01',
    period_end: '2026-12-31',
    as_of: '2026-12-14T10:00:00Z',
    users: 4000,
    calls: 1600000,
    photos: 9000,
    header: { calls_with_id: 900, calls_missing_id: 100, calls_invalid_id: 0, share_with_id: 0.9 },
    heavy_end_users: 2,
    statement: {
      users: 4000,
      calls: 1600000,
      photos: 9000,
      tier_label: '2,001 to 5,000 users',
      tier_sort_order: 2,
      tier_basis: 'users',
      users_limit: 5000,
      calls_included: 2500000,
      photos_included: 5000,
      extra_users: 0,
      extra_calls: 0,
      extra_photos: 4000,
      user_fee_cents: 30000,
      call_fee_cents: 0,
      photo_fee_cents: 4000,
      total_cents: 34000,
    },
    next_tier: { label: '5,001 to 10,000 users', monthly_price_cents: 50000, starts_after_users: 5000, starts_after_calls: 2500000 },
    photo_monthly_cap: 25000,
    top_end_users: [{ end_user: 'a1b2c3d4e5f6', calls: 1800, photo_calls: 3, active_days: 9 }, { calls: 5 }],
  },
  end_user_header: 'X-End-User-Id',
}

test('a disabled or junk payload is no Enterprise', () => {
  assert.equal(normalizeEnterpriseView(null).enabled, false)
  assert.equal(normalizeEnterpriseView({ enabled: false }).enabled, false)
  assert.equal(normalizeEnterpriseView({ enabled: 'yes' }).enabled, false)
  assert.equal(showEnterpriseNav(NO_ENTERPRISE), false)
})

test('an Enterprise payload keeps mode, rules flag and the month', () => {
  const view = normalizeEnterpriseView(viewPayload)
  assert.equal(view.enabled, true)
  assert.equal(view.end_user_mode, 'warn')
  assert.equal(view.end_user_records_allowed, true)
  assert.equal(view.month.users, 4000)
  assert.equal(view.month.statement.total_cents, 34000)
  assert.equal(view.month.top_end_users.length, 1)
  assert.equal(view.pricing.rate_limit_per_minute, null)
  assert.equal(showEnterpriseNav(view), true)
})

test('nav item shows only when Enterprise is on', () => {
  const items = [{ href: '/dashboard/usage' }, { href: ENTERPRISE_PATH }]
  const entry = { href: ENTERPRISE_PATH }
  assert.deepEqual(enterpriseNavItems(items, false, entry), [{ href: '/dashboard/usage' }])
  assert.deepEqual(enterpriseNavItems(items, true, entry), [{ href: '/dashboard/usage' }, entry])
})

test('usage cards compare against the tier and price the extras', () => {
  const view = normalizeEnterpriseView(viewPayload)
  const cards = usageCards(view.month, view.pricing)
  assert.deepEqual(
    cards.map((c) => [c.key, c.value]),
    [
      ['users', '4,000 of 5,000'],
      ['calls', '1,600,000 of 2.5M'],
      ['photos', '9,000 of 5,000'],
      ['bill', '$340'],
    ]
  )
  assert.equal(cards[0].percent, 80)
  assert.match(cards[2].hint, /4,000 extra at \$0\.01 each/)
})

test('bill lines list only the fees that apply', () => {
  const view = normalizeEnterpriseView(viewPayload)
  assert.deepEqual(billLines(view.month.statement), [
    { label: '2,001 to 5,000 users', value: '$300' },
    { label: '4,000 extra photos', value: '$40' },
    { label: 'Total', value: '$340' },
  ])
})

test('next tier and header coverage read plainly', () => {
  const view = normalizeEnterpriseView(viewPayload)
  assert.equal(
    nextTierText(view.month),
    'Next tier: 5,001 to 10,000 users ($500/mo), after more than 5,000 users or more than 2,500,000 calls this month.'
  )
  assert.equal(headerCoverageText(view.month.header), '90% of calls this month sent a valid X-End-User-Id. 100 did not.')
  assert.equal(
    headerCoverageText({ calls_with_id: 0, calls_missing_id: 0, calls_invalid_id: 0, share_with_id: null }),
    null
  )
})

test('month labels and statement statuses', () => {
  assert.equal(monthLabel('2026-11'), 'November 2026')
  assert.equal(monthLabel('bad'), 'bad')
  assert.equal(statementStatusLabel('final').label, 'Ready to invoice')
  assert.equal(statementStatusLabel('paid').tone, 'green')
})

test('statement rows normalize and drop junk', () => {
  const rows = normalizeStatementList({
    statements: [
      { account_user_id: 7, month: '2026-11', total_cents: 15000, status: 'invoiced', tier_label: 'Up to 2,000 users' },
      { nope: true },
    ],
  })
  assert.equal(rows.length, 1)
  assert.equal(rows[0].status, 'invoiced')
  assert.equal(rows[0].total_cents, 15000)
})

test('the API client reads both endpoints', async () => {
  const calls = []
  const api = createEnterpriseApi({
    async get(path) {
      calls.push(path)
      return { data: path.endsWith('statements') ? { statements: [] } : viewPayload }
    },
  })
  assert.equal((await api.view()).enabled, true)
  assert.deepEqual(await api.statements(), [])
  assert.deepEqual(calls, ['/api/v1/users/enterprise', '/api/v1/users/enterprise/statements'])
})

test('end-user docs carry the header rules and error codes', () => {
  assert.match(endUserHeaderRules().join(' '), /8 to 64 characters/)
  assert.deepEqual(
    endUserErrorRows().map((r) => r.code),
    ['end_user_id_required', 'end_user_id_invalid', 'paging_limit', 'end_user_blocked', 'end_user_rate_limited']
  )
  assert.match(endUserCodeSample('https://api.example/api/v1/search/foods'), /-H "X-End-User-Id: user_8f3a2c91"/)
  assert.equal(savedRecordRules().length, 7)
  assert.match(modeText('required'), /400/)
})
