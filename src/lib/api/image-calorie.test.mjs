import assert from 'node:assert/strict'
import test from 'node:test'
import { NO_IMAGE_CALORIE, createImageCalorieApi, normalizeImageCalorieAccess } from './image-calorie.ts'

const pilotPayload = {
  available: true,
  meter: 'pilot',
  endpoint: '/api/v1/vision/calories',
  method: 'POST',
  file_field: 'file',
  formats: ['JPEG', 'PNG', 'WebP'],
  max_upload_bytes: 5242880,
  key_product: 'rest',
  pilot: {
    used_this_month: 12,
    monthly_cap: 100,
    used_today: 3,
    daily_cap: 20,
    resets_on: '2026-12-01',
    ends_on: '2027-02-23',
  },
  credits: null,
  mcp: null,
}

test('junk and unavailable payloads fall back to no access', () => {
  assert.deepEqual(normalizeImageCalorieAccess(null), NO_IMAGE_CALORIE)
  assert.deepEqual(normalizeImageCalorieAccess([]), NO_IMAGE_CALORIE)
  assert.deepEqual(normalizeImageCalorieAccess({ available: false, meter: null }), NO_IMAGE_CALORIE)
  assert.deepEqual(normalizeImageCalorieAccess({ available: 'yes', meter: 'pilot' }), NO_IMAGE_CALORIE)
  assert.deepEqual(normalizeImageCalorieAccess({ available: true, meter: 'free' }), NO_IMAGE_CALORIE)
})

test('a pilot payload keeps its usage block', () => {
  const access = normalizeImageCalorieAccess(pilotPayload)
  assert.equal(access.available, true)
  assert.equal(access.meter, 'pilot')
  assert.deepEqual(access.pilot, pilotPayload.pilot)
  assert.equal(access.credits, null)
  assert.equal(access.mcp, null)
})

test('blocks for other meters are ignored', () => {
  const access = normalizeImageCalorieAccess({ ...pilotPayload, credits: { balance: 5, cost_per_call: 1 } })
  assert.equal(access.credits, null)
})

test('credits block recomputes calls left and guards the cost', () => {
  const access = normalizeImageCalorieAccess({
    available: true,
    meter: 'credits',
    credits: { balance: 9, cost_per_call: 2, calls_left: 999 },
  })
  assert.deepEqual(access.credits, { balance: 9, cost_per_call: 2, calls_left: 4 })
  const zeroCost = normalizeImageCalorieAccess({ available: true, meter: 'credits', credits: { balance: 3, cost_per_call: 0 } })
  assert.equal(zeroCost.credits.cost_per_call, 1)
})

test('mcp block keeps an unlimited cap as null and forces mcp keys', () => {
  const access = normalizeImageCalorieAccess({
    available: true,
    meter: 'mcp',
    key_product: 'rest',
    mcp: { used_this_month: 7, monthly_cap: null, used_today: 2, daily_cap: 20, trial: false },
  })
  assert.equal(access.key_product, 'mcp')
  assert.deepEqual(access.mcp, { used_this_month: 7, monthly_cap: null, used_today: 2, daily_cap: 20, trial: false })
})

test('missing usage block stays null so the page can say so', () => {
  const access = normalizeImageCalorieAccess({ ...pilotPayload, pilot: null })
  assert.equal(access.available, true)
  assert.equal(access.pilot, null)
})

test('bad fields fall back to safe defaults', () => {
  const access = normalizeImageCalorieAccess({
    available: true,
    meter: 'pilot',
    endpoint: 'https://evil.example/upload',
    formats: [1, null],
    max_upload_bytes: -5,
    pilot: { used_this_month: 'x', monthly_cap: 100, resets_on: 'soon' },
  })
  assert.equal(access.endpoint, '/api/v1/vision/calories')
  assert.deepEqual(access.formats, ['JPEG', 'PNG', 'WebP'])
  assert.equal(access.max_upload_bytes, 5242880)
  assert.equal(access.pilot.used_this_month, 0)
  assert.equal(access.pilot.resets_on, null)
})

test('the api calls the users endpoint and normalizes', async () => {
  const calls = []
  const api = createImageCalorieApi({
    async get(endpoint) {
      calls.push(endpoint)
      return { data: pilotPayload }
    },
  })
  const access = await api.access()
  assert.deepEqual(calls, ['/api/v1/users/image-to-calorie'])
  assert.equal(access.meter, 'pilot')
})

test('an enterprise payload keeps its photo allowance block', () => {
  const access = normalizeImageCalorieAccess({
    ...pilotPayload,
    meter: 'enterprise',
    pilot: null,
    enterprise: {
      photos_used: 12,
      photos_included: 5000,
      photos_extra: 0,
      photo_monthly_cap: 25000,
      per_extra_photo_cents: 1,
      resets_on: '2026-12-01',
    },
  })
  assert.equal(access.meter, 'enterprise')
  assert.equal(access.pilot, null)
  assert.deepEqual(access.enterprise, {
    photos_used: 12,
    photos_included: 5000,
    photos_extra: 0,
    photo_monthly_cap: 25000,
    per_extra_photo_cents: 1,
    resets_on: '2026-12-01',
  })
})
