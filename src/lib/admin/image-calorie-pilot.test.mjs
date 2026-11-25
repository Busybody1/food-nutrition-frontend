import assert from 'node:assert/strict'
import test from 'node:test'
import {
  failedTodayText,
  formatPilotDate,
  formatPilotTimestamp,
  initialPilotDraft,
  pilotCanSave,
  pilotDraftError,
  pilotEndDateError,
  pilotNotes,
  pilotPill,
  pilotRequestBody,
  usagePercent,
  usageText,
} from './image-calorie-pilot.ts'

const base = {
  state: 'off',
  enabled: false,
  expires_on: null,
  reason: null,
  meter: 'pilot',
  plan_name: 'Free',
  platform_enabled: true,
  today: '2026-11-25',
  default_expires_on: '2027-02-23',
  max_expires_on: '2027-11-25',
}

const active = { ...base, state: 'active', enabled: true, expires_on: '2027-02-23', reason: 'Acme Foods' }
const expired = { ...base, state: 'expired', enabled: true, expires_on: '2026-11-20', reason: 'Acme Foods' }

test('an off grant starts with the default date and an empty reason', () => {
  assert.deepEqual(initialPilotDraft(base), { enabled: false, expiresOn: '2027-02-23', reason: '' })
})

test('an active grant starts from its saved date and reason', () => {
  assert.deepEqual(initialPilotDraft({ ...active, expires_on: '2027-01-10' }), {
    enabled: true,
    expiresOn: '2027-01-10',
    reason: 'Acme Foods',
  })
})

test('an expired grant is prefilled with a fresh default date', () => {
  assert.deepEqual(initialPilotDraft(expired), { enabled: true, expiresOn: '2027-02-23', reason: 'Acme Foods' })
})

test('nothing to save until something changes', () => {
  assert.equal(pilotRequestBody(base, initialPilotDraft(base)), null)
  assert.equal(pilotRequestBody(active, initialPilotDraft(active)), null)
  assert.equal(pilotCanSave(base, initialPilotDraft(base)), false)
  assert.equal(pilotCanSave(active, initialPilotDraft(active)), false)
})

test('whitespace around the reason is not a change', () => {
  const draft = { ...initialPilotDraft(active), reason: '  Acme Foods  ' }
  assert.equal(pilotRequestBody(active, draft), null)
})

test('turning on needs a reason before save is allowed', () => {
  const draft = { ...initialPilotDraft(base), enabled: true }
  assert.deepEqual(pilotRequestBody(base, draft), { enabled: true, expires_on: '2027-02-23', reason: '' })
  assert.equal(pilotCanSave(base, draft), false)
  assert.equal(pilotDraftError(base, draft), 'A reason is required to turn the pilot on.')
  const named = { ...draft, reason: ' Acme Foods ' }
  assert.equal(pilotCanSave(base, named), true)
  assert.deepEqual(pilotRequestBody(base, named), { enabled: true, expires_on: '2027-02-23', reason: 'Acme Foods' })
})

test('a reason over 200 characters cannot be saved', () => {
  const draft = { enabled: true, expiresOn: '2027-02-23', reason: 'x'.repeat(201) }
  assert.equal(pilotCanSave(base, draft), false)
  assert.equal(pilotCanSave(base, { ...draft, reason: 'x'.repeat(200) }), true)
})

test('changing the end date of an active grant is a save', () => {
  const draft = { ...initialPilotDraft(active), expiresOn: '2027-01-31' }
  assert.deepEqual(pilotRequestBody(active, draft), {
    enabled: true,
    expires_on: '2027-01-31',
    reason: 'Acme Foods',
  })
  assert.equal(pilotCanSave(active, draft), true)
})

test('turning off sends only the switch', () => {
  const draft = { ...initialPilotDraft(active), enabled: false, reason: '' }
  assert.deepEqual(pilotRequestBody(active, draft), { enabled: false })
  assert.equal(pilotCanSave(active, draft), true)
  assert.equal(pilotCanSave(active, draft, true), false)
})

test('turning off an expired grant is allowed', () => {
  assert.deepEqual(pilotRequestBody(expired, { ...initialPilotDraft(expired), enabled: false }), { enabled: false })
})

test('an expired grant can resume with the prefilled date', () => {
  const draft = initialPilotDraft(expired)
  assert.equal(pilotCanSave(expired, draft), true)
  assert.equal(pilotRequestBody(expired, draft).expires_on, '2027-02-23')
})

test('end date bounds', () => {
  assert.equal(pilotEndDateError('2026-11-25', '2026-11-25', '2027-11-25'), null)
  assert.equal(pilotEndDateError('2027-11-25', '2026-11-25', '2027-11-25'), null)
  assert.equal(pilotEndDateError('2026-11-24', '2026-11-25', '2027-11-25'), 'The end date cannot be in the past.')
  assert.equal(
    pilotEndDateError('2027-11-26', '2026-11-25', '2027-11-25'),
    'The end date cannot be more than 365 days away.'
  )
  assert.equal(pilotEndDateError('', '2026-11-25', '2027-11-25'), 'Pick an end date.')
  const draft = { enabled: true, expiresOn: '2026-11-01', reason: 'Acme' }
  assert.equal(pilotCanSave(base, draft), false)
})

test('pill label and tone', () => {
  assert.deepEqual(pilotPill('off'), { label: 'Off', tone: 'neutral' })
  assert.deepEqual(pilotPill('active'), { label: 'Active', tone: 'green' })
  assert.deepEqual(pilotPill('expired'), { label: 'Expired', tone: 'orange' })
})

test('notes for each meter, expiry and the platform flag', () => {
  assert.deepEqual(pilotNotes(active), [])
  assert.deepEqual(pilotNotes({ ...base, meter: 'credits', plan_name: 'Enterprise' }), [
    'This account is on Enterprise. That plan already includes photo analysis, billed in credits. The 100 call cap is not added.',
  ])
  assert.match(pilotNotes({ ...base, meter: 'mcp' })[0], /MCP photo allowance of 150 a month and 20 a day/)
  assert.deepEqual(pilotNotes({ ...base, meter: 'mcp' }, false), [
    'The pilot does not apply to the MCP plan in this release.',
  ])
  assert.deepEqual(pilotNotes(expired), ['Ended 20 Nov 2026. Set a new end date to resume.'])
  assert.deepEqual(pilotNotes({ ...active, platform_enabled: false }), [
    'The pilot is switched off for the whole platform. Grants are saved but not applied.',
  ])
})

test('no note contains an em dash', () => {
  const all = [
    ...pilotNotes({ ...expired, meter: 'credits', platform_enabled: false }),
    ...pilotNotes({ ...base, meter: 'mcp' }),
  ]
  for (const note of all) assert.equal(note.includes('—'), false)
})

test('dates are shown in UTC', () => {
  assert.equal(formatPilotDate('2027-02-23'), '23 Feb 2027')
  assert.equal(formatPilotDate(null), '')
  assert.equal(formatPilotTimestamp('2026-11-25T10:12:00Z'), '25 Nov 2026, 10:12 UTC')
  assert.equal(formatPilotTimestamp('2026-11-25T23:30:00Z'), '25 Nov 2026, 23:30 UTC')
  assert.equal(formatPilotTimestamp('garbage'), '')
})

test('usage text and bar', () => {
  assert.equal(usageText(12, 100), '12 / 100')
  assert.equal(usageText(-1, 100), '0 / 100')
  assert.equal(usagePercent(12, 100), 12)
  assert.equal(usagePercent(150, 100), 100)
  assert.equal(usagePercent(1, 0), 0)
  assert.equal(failedTodayText(0), null)
  assert.equal(failedTodayText(1), '1 failed today')
})
