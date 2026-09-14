import assert from 'node:assert/strict'
import test from 'node:test'
import {
  MAX_KCAL_PER_100G,
  MAX_MACRO_G,
  atwaterDeltaPct,
  atwaterEnergyRange,
  atwaterInBand,
  atwaterKcal,
  atwaterTone,
  physicallyImpossible,
} from '../food-macros.ts'

test('atwaterKcal uses 4-4-9 and optional alcohol', () => {
  assert.equal(atwaterKcal(21.5, 20, 50), 21.5 * 4 + 20 * 4 + 50 * 9)
  assert.equal(atwaterKcal(0, 0, 0, 34), 238)
})

test('high fiber powder is inside the energy band', () => {
  const range = atwaterEnergyRange(50, 40, 1, 0, 40)
  assert.equal(range.min, 209)
  assert.equal(range.max, 369)
  assert.equal(atwaterKcal(50, 40, 1, 0, 40), 289)
  assert.equal(atwaterInBand(210, range), true)
  assert.equal(atwaterInBand(50, range), false)
})

test('atwaterDeltaPct is zero for near-zero foods', () => {
  assert.equal(atwaterDeltaPct(1, 1), 0)
})

test('atwaterTone bands', () => {
  assert.equal(atwaterTone(5), 'green')
  assert.equal(atwaterTone(15), 'amber')
  assert.equal(atwaterTone(40), 'red')
  assert.equal(atwaterTone(null), 'neutral')
})

test('physicallyImpossible rejects calorie and macro ceilings', () => {
  assert.equal(
    physicallyImpossible({ kcal: 903, protein: 0, carbs: 0, fat: 100 }),
    `Calories cannot exceed ${MAX_KCAL_PER_100G} per 100 g`
  )
  assert.ok(
    physicallyImpossible({ kcal: 400, protein: 40, carbs: 40, fat: 40 })?.includes(
      String(MAX_MACRO_G)
    )
  )
  assert.equal(
    physicallyImpossible({ kcal: 165, protein: 31, carbs: 0, fat: 3.6 }),
    null
  )
})
