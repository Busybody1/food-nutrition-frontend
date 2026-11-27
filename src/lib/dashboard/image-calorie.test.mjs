import assert from 'node:assert/strict'
import test from 'node:test'
import {
  IMAGE_CALORIE_PATH,
  accessNavItems,
  apiKeysHref,
  codeSamples,
  countingRules,
  endpointUrl,
  errorRows,
  exampleResponse,
  formatUploadLimit,
  limitCards,
  listWithOr,
  meterLabel,
  responseNotes,
  showImageCalorieNav,
  usageMissing,
} from './image-calorie.ts'

const base = {
  available: true,
  meter: 'pilot',
  endpoint: '/api/v1/vision/calories',
  method: 'POST',
  file_field: 'file',
  formats: ['JPEG', 'PNG', 'WebP'],
  max_upload_bytes: 5242880,
  key_product: 'rest',
  pilot: null,
  credits: null,
  mcp: null,
}

const pilot = {
  ...base,
  pilot: { used_this_month: 12, monthly_cap: 100, used_today: 3, daily_cap: 20, resets_on: '2026-12-01', ends_on: '2027-02-23' },
}
const credits = { ...base, meter: 'credits', credits: { balance: 9, cost_per_call: 1, calls_left: 9 } }
const mcp = {
  ...base,
  meter: 'mcp',
  key_product: 'mcp',
  mcp: { used_this_month: 7, monthly_cap: 150, used_today: 2, daily_cap: 20, trial: false },
}

const nav = [
  { name: 'REST API', href: '/dashboard/api-keys?product=rest' },
  { name: 'MCP', href: '/dashboard/api-keys?product=mcp' },
]
const photoItem = { name: 'Image to calories', href: IMAGE_CALORIE_PATH }

test('the nav item shows only with access and never twice', () => {
  assert.equal(showImageCalorieNav(null), false)
  assert.equal(showImageCalorieNav({ available: false }), false)
  assert.equal(showImageCalorieNav({ available: true }), true)
  assert.deepEqual(accessNavItems(nav, false, photoItem), nav)
  assert.deepEqual(accessNavItems(nav, true, photoItem), [...nav, photoItem])
  assert.deepEqual(accessNavItems([...nav, photoItem], true, photoItem), [...nav, photoItem])
  assert.deepEqual(accessNavItems([...nav, photoItem], false, photoItem), nav)
})

test('meter labels', () => {
  assert.equal(meterLabel('pilot'), 'Photo test')
  assert.equal(meterLabel('credits'), 'Credits')
  assert.equal(meterLabel('mcp'), 'MCP allowance')
  assert.equal(meterLabel(null), 'Not available')
})

test('the key link follows the key product', () => {
  assert.equal(apiKeysHref(pilot), '/dashboard/api-keys?product=rest')
  assert.equal(apiKeysHref(mcp), '/dashboard/api-keys?product=mcp')
})

test('pilot limit cards', () => {
  assert.deepEqual(limitCards(pilot), [
    { key: 'month', label: 'Used this month', value: '12 of 100', hint: 'Resets Dec 1', percent: 12 },
    { key: 'today', label: 'Used today', value: '3 of 20', hint: 'Resets at 00:00 UTC', percent: 15 },
    { key: 'ends', label: 'Photo test ends', value: 'Feb 23, 2027', hint: 'Free of charge until then', percent: null },
  ])
})

test('credit limit cards', () => {
  const cards = limitCards({ ...credits, credits: { balance: 1500, cost_per_call: 2, calls_left: 750 } })
  assert.deepEqual(
    cards.map((card) => [card.label, card.value]),
    [
      ['Credit balance', '1,500'],
      ['Cost per photo', '2 credits'],
      ['Photos left', '750'],
    ]
  )
  assert.equal(limitCards(credits)[1].value, '1 credit')
})

test('mcp limit cards, unlimited and trial', () => {
  assert.deepEqual(
    limitCards(mcp).map((card) => [card.label, card.value, card.percent]),
    [
      ['Photos this month', '7 of 150', (7 / 150) * 100],
      ['Photos today', '2 of 20', 10],
    ]
  )
  const unlimited = limitCards({ ...mcp, mcp: { ...mcp.mcp, monthly_cap: null } })
  assert.equal(unlimited[0].value, '7')
  assert.equal(unlimited[0].percent, null)
  const trial = limitCards({ ...mcp, mcp: { used_this_month: 3, monthly_cap: 10, used_today: 1, daily_cap: null, trial: true } })
  assert.deepEqual(trial.map((card) => [card.label, card.value]), [['Trial photos', '3 of 10']])
})

test('a capped bar never goes past 100', () => {
  const over = limitCards({ ...pilot, pilot: { ...pilot.pilot, used_this_month: 140 } })
  assert.equal(over[0].percent, 100)
})

test('missing usage is reported, no access is not', () => {
  assert.equal(usageMissing(base), true)
  assert.equal(usageMissing(pilot), false)
  assert.equal(usageMissing({ ...base, available: false, meter: null }), false)
  assert.deepEqual(limitCards(base), [])
})

test('endpoint url joins without double slashes', () => {
  assert.equal(endpointUrl('https://api.example.com/', '/api/v1/vision/calories'), 'https://api.example.com/api/v1/vision/calories')
  assert.equal(endpointUrl('https://api.example.com', '/api/v1/vision/calories'), 'https://api.example.com/api/v1/vision/calories')
})

test('code samples use the url, the file field and an env key', () => {
  const url = 'https://api.example.com/api/v1/vision/calories'
  const samples = codeSamples(url)
  for (const code of Object.values(samples)) {
    assert.ok(code.includes(url))
    assert.ok(code.includes('X-API-Key'))
    assert.ok(code.includes('CALORIE_API_KEY'))
  }
  assert.ok(samples.curl.includes('-F "file=@lunch.jpg"'))
  assert.ok(samples.javascript.includes("form.append('file', photoFile)"))
  assert.ok(samples.python.includes('files={"file": ('))
  assert.ok(codeSamples(url, 'image').curl.includes('-F "image=@lunch.jpg"'))
})

test('example responses match each meter', () => {
  const pilotBody = JSON.parse(exampleResponse(pilot))
  assert.deepEqual(Object.keys(pilotBody), [
    'request_id',
    'calls_used',
    'calls_remaining',
    'monthly_cap',
    'calls_used_today',
    'daily_cap',
    'resets_on',
    'estimate',
  ])
  assert.equal(pilotBody.calls_remaining, 87)
  const creditBody = JSON.parse(exampleResponse(credits))
  assert.deepEqual(Object.keys(creditBody), ['request_id', 'credits_charged', 'credits_remaining', 'estimate'])
  assert.equal(creditBody.credits_remaining, 8)
  assert.deepEqual(Object.keys(JSON.parse(exampleResponse(mcp))), ['request_id', 'estimate'])
  assert.equal(pilotBody.estimate.items.length, 1)
})

test('response notes and rules per meter', () => {
  assert.equal(responseNotes(pilot).length, 3)
  assert.equal(responseNotes(mcp).length, 2)
  assert.equal(formatUploadLimit(5242880), '5 MB')
  assert.equal(formatUploadLimit(2.5 * 1024 * 1024), '2.5 MB')
  assert.equal(countingRules(pilot)[0], 'Send one JPEG, PNG or WebP image of up to 5 MB in the file field.')
  assert.equal(listWithOr(['JPEG']), 'JPEG')
  assert.equal(listWithOr(['JPEG', 'PNG']), 'JPEG or PNG')
  assert.ok(countingRules(pilot).some((rule) => rule.includes('60 calls a day')))
  assert.ok(countingRules(credits).some((rule) => rule.includes('402')))
  assert.ok(countingRules(mcp).some((rule) => rule.includes('MCP key works')))
  for (const access of [pilot, credits, mcp]) {
    assert.ok(countingRules(access).at(-1).includes('per-minute rate limit'))
  }
})

test('error rows carry the codes the endpoint returns', () => {
  const codes = (meter) => errorRows(meter).map((row) => row.code)
  assert.ok(codes('pilot').includes('image_calorie_pilot_daily_cap'))
  assert.ok(codes('pilot').includes('image_calorie_pilot_attempt_limit'))
  assert.ok(!codes('pilot').includes('insufficient_credits'))
  assert.ok(codes('credits').includes('insufficient_credits'))
  assert.ok(codes('mcp').includes('image_calorie_mcp_photo_limit'))
  assert.ok(codes('mcp').includes(null))
})

test('no em dashes in any copy', () => {
  const copy = [pilot, credits, mcp].flatMap((access) => [
    ...countingRules(access),
    ...responseNotes(access),
    ...limitCards(access).flatMap((card) => [card.label, card.value, card.hint]),
    ...errorRows(access.meter).map((row) => row.meaning),
  ])
  for (const text of copy) assert.equal(text.includes('—'), false, text)
})

const enterprise = {
  ...base,
  meter: 'enterprise',
  enterprise: {
    photos_used: 5200,
    photos_included: 5000,
    photos_extra: 200,
    photo_monthly_cap: 25000,
    per_extra_photo_cents: 1,
    resets_on: '2026-12-01',
  },
}

test('enterprise limit cards show included, extra and the safety limit', () => {
  assert.equal(meterLabel('enterprise'), 'Enterprise')
  const cards = limitCards(enterprise)
  assert.deepEqual(
    cards.map((c) => [c.key, c.value]),
    [
      ['month', '5,200 of 5,000'],
      ['extra', '200'],
      ['cap', '25,000'],
    ]
  )
  assert.equal(cards[0].percent, 100)
  assert.match(cards[1].hint, /\$0\.01 each/)
  assert.equal(usageMissing({ ...enterprise, enterprise: null }), true)
})

test('enterprise samples, example, rules and errors', () => {
  const samples = codeSamples('https://api.example.com/api/v1/vision/calories', 'file', 'X-End-User-Id')
  assert.match(samples.curl, /-H "X-End-User-Id: user_8f3a2c91"/)
  assert.match(samples.javascript, /'X-End-User-Id': userId/)
  assert.match(samples.python, /"X-End-User-Id": user_id/)
  assert.doesNotMatch(codeSamples('https://x/api', 'file').curl, /X-End-User-Id/)
  const example = JSON.parse(exampleResponse(enterprise))
  assert.equal(example.photos_included, 5000)
  assert.equal(example.photo_monthly_cap, 25000)
  assert.match(countingRules(enterprise).join(' '), /Each photo after that is \$0\.01/)
  assert.match(responseNotes(enterprise).join(' '), /photos_extra/)
  const codes = errorRows('enterprise').map((r) => r.code)
  assert.ok(codes.includes('image_calorie_monthly_cap'))
  assert.ok(codes.includes('image_calorie_attempt_limit'))
  const copy = [...countingRules(enterprise), ...limitCards(enterprise).flatMap((c) => [c.label, c.hint])]
  for (const text of copy) assert.equal(text.includes('—'), false, text)
})
