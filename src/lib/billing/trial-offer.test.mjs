import assert from 'node:assert/strict'
import test from 'node:test'
import { isRestPaidPlan, restSubscribeLabel, restTrialChargeNote } from './trial-offer.ts'

test('only paid REST plans join the 5-day card test', () => {
  assert.equal(isRestPaidPlan({ name: 'Plus', plan_tier: 'plus', monthly_price: 49 }), true)
  assert.equal(isRestPaidPlan({ name: 'Free', plan_tier: 'free', monthly_price: 0 }), false)
  assert.equal(isRestPaidPlan({ name: 'Enterprise', plan_tier: 'enterprise', monthly_price: 500 }), false)
  assert.equal(isRestPaidPlan({ name: 'BusyBody MCP', plan_tier: 'mcp', monthly_price: 29 }), false)
})

test('the 5-day arm renames subscribe and states the charge', () => {
  assert.equal(restSubscribeLabel({ paid: true, trialDays: 5, offerPending: false }), 'Start 5-day trial')
  assert.equal(restSubscribeLabel({ paid: true, trialDays: null, offerPending: false }), null)
  assert.equal(restSubscribeLabel({ paid: true, trialDays: 5, offerPending: true }), null)
  assert.equal(restSubscribeLabel({ paid: false, trialDays: 5, offerPending: false }), null)
  assert.match(restTrialChargeNote(5), /after 5 days/)
  assert.equal(restTrialChargeNote(null), null)
})
