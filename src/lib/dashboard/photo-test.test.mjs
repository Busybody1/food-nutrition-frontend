import assert from 'node:assert/strict'
import test from 'node:test'
import { formatEndDay, formatResetDay, photoTestSentence } from './photo-test.ts'

const block = {
  used_this_month: 12,
  monthly_cap: 100,
  used_today: 3,
  daily_cap: 20,
  resets_on: '2026-12-01',
  ends_on: '2027-02-23',
}

test('the dashboard sentence', () => {
  assert.equal(
    photoTestSentence(block),
    'Photo test: 12 of 100 used this month. Resets Dec 1. Ends Feb 23, 2027.'
  )
})

test('no block means no line', () => {
  assert.equal(photoTestSentence(null), null)
  assert.equal(photoTestSentence(undefined), null)
})

test('a missing end date is left out', () => {
  assert.equal(
    photoTestSentence({ ...block, ends_on: null }),
    'Photo test: 12 of 100 used this month. Resets Dec 1.'
  )
})

test('dates do not shift for viewers west of UTC', () => {
  assert.equal(formatResetDay('2027-01-01'), 'Jan 1')
  assert.equal(formatEndDay('2027-03-01'), 'Mar 1, 2027')
})

test('bad counts are shown as zero', () => {
  assert.equal(
    photoTestSentence({ ...block, used_this_month: Number.NaN }),
    'Photo test: 0 of 100 used this month. Resets Dec 1. Ends Feb 23, 2027.'
  )
})

test('no em dashes', () => {
  assert.equal(photoTestSentence(block).includes('—'), false)
})
