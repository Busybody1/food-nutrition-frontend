import assert from 'node:assert/strict'
import test from 'node:test'
import {
  NUMBER_FIELDS,
  enterpriseDraftChanged,
  enterpriseDraftError,
  enterpriseRequestBody,
  incidentActionLabel,
  incidentKindLabel,
  initialEnterpriseDraft,
  parseWhole,
  previousMonth,
  recentMonths,
} from './admin.ts'

const config = {
  is_active: true,
  end_user_mode: 'warn',
  per_extra_user_cents: null,
  per_1k_extra_calls_cents: null,
  per_extra_photo_cents: null,
  calls_per_extra_user: null,
  photos_included: null,
  photo_monthly_cap: 40000,
  unique_foods_pct_override: 10,
  coverage_12m_pct_override: null,
  end_user_records_allowed: true,
  started_on: '2026-12-01',
  notes: 'Patrick, US meal app',
}

test('a new account starts active, in warn mode, with every override blank', () => {
  const draft = initialEnterpriseDraft(null)
  assert.equal(draft.isActive, true)
  assert.equal(draft.mode, 'warn')
  for (const field of NUMBER_FIELDS) assert.equal(draft[field.key], '')
  assert.equal(enterpriseDraftChanged(null, draft), true)
})

test('blank overrides become null and numbers parse', () => {
  const draft = initialEnterpriseDraft(config)
  assert.equal(draft.photo_monthly_cap, '40000')
  assert.equal(enterpriseDraftChanged(config, draft), false)
  const body = enterpriseRequestBody({ ...draft, per_extra_user_cents: '3', notes: '  Patrick,   US app ' })
  assert.equal(body.per_extra_user_cents, 3)
  assert.equal(body.per_1k_extra_calls_cents, null)
  assert.equal(body.photo_monthly_cap, 40000)
  assert.equal(body.unique_foods_pct_override, 10)
  assert.equal(body.notes, 'Patrick, US app')
  assert.equal(body.started_on, '2026-12-01')
  assert.equal(body.end_user_mode, 'warn')
})

test('bad numbers and out-of-range values are caught', () => {
  const draft = initialEnterpriseDraft(config)
  assert.match(enterpriseDraftError({ ...draft, per_extra_user_cents: '0.5' }), /whole number/)
  assert.match(enterpriseDraftError({ ...draft, unique_foods_pct_override: '0' }), /use 1 to 100/)
  assert.match(enterpriseDraftError({ ...draft, coverage_12m_pct_override: '101' }), /use 1 to 100/)
  assert.equal(enterpriseRequestBody({ ...draft, photos_included: 'abc' }), null)
  assert.equal(parseWhole('25,000'), 25000)
  assert.equal(parseWhole(''), null)
  assert.equal(parseWhole('-1'), 'invalid')
})

test('incident kinds and actions read plainly', () => {
  assert.equal(incidentKindLabel('scrape_orphan_lookups').label, 'Unseen food lookups')
  assert.equal(incidentKindLabel('breadth_foods').label, 'Scrape breadth')
  assert.equal(incidentKindLabel('scrape_new_signal').label, 'New signal')
  assert.equal(incidentActionLabel('slowed').label, 'Slowed down')
  assert.equal(incidentActionLabel('held').tone, 'rose')
  assert.equal(incidentActionLabel('alert_only').label, 'Alert only')
})

test('month helpers count back in UTC', () => {
  const today = new Date(Date.UTC(2027, 0, 15))
  assert.equal(previousMonth(today), '2026-12')
  assert.deepEqual(recentMonths(3, today), ['2027-01', '2026-12', '2026-11'])
})
