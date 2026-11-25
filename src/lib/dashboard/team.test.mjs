import assert from 'node:assert/strict'
import test from 'node:test'
import {
  accountNavItems,
  allowanceQuotaHint,
  allowanceRemainingText,
  closedInviteMessage,
  inviteSubtitle,
  formatTeamDate,
  memberDisplayName,
  pendingInviteText,
  rateLimitText,
  resetsOnText,
  seatText,
  seatsFull,
  shareLabel,
  shareOfPool,
  showBillingNav,
  showTeamNav,
  teamOwnerLabel,
} from './team.ts'

const ACCOUNT = [
  { name: 'Usage', href: '/dashboard/usage' },
  { name: 'Billing', href: '/dashboard/billing' },
  { name: 'Account', href: '/dashboard/account' },
  { name: 'Feedback', href: '#dashboard-feedback' },
]
const TEAM = { name: 'Team', href: '/dashboard/team' }

test('nav flags follow the role', () => {
  assert.equal(showTeamNav('none'), false)
  assert.equal(showTeamNav('owner'), true)
  assert.equal(showTeamNav('member'), true)
  assert.equal(showBillingNav('member'), false)
  assert.equal(showBillingNav('owner'), true)
  assert.equal(showBillingNav('none'), true)
})

test('accountNavItems leaves a solo account unchanged', () => {
  assert.deepEqual(accountNavItems(ACCOUNT, 'none', TEAM).map((i) => i.name), [
    'Usage',
    'Billing',
    'Account',
    'Feedback',
  ])
})

test('accountNavItems adds Team after Usage for an owner', () => {
  assert.deepEqual(accountNavItems(ACCOUNT, 'owner', TEAM).map((i) => i.name), [
    'Usage',
    'Team',
    'Billing',
    'Account',
    'Feedback',
  ])
})

test('accountNavItems hides Billing for a member', () => {
  assert.deepEqual(accountNavItems(ACCOUNT, 'member', TEAM).map((i) => i.name), [
    'Usage',
    'Team',
    'Account',
    'Feedback',
  ])
})

test('accountNavItems never duplicates Team and appends when Usage is missing', () => {
  const items = accountNavItems([TEAM, { name: 'Account', href: '/dashboard/account' }], 'owner', TEAM)
  assert.deepEqual(items.map((i) => i.name), ['Account', 'Team'])
})

test('seat text and fullness', () => {
  assert.equal(seatText(2, 3), '2 of 3')
  assert.equal(seatText(-1, Number.NaN), '0 of 0')
  assert.equal(seatsFull(3, 3), true)
  assert.equal(seatsFull(4, 3), true)
  assert.equal(seatsFull(2, 3), false)
  assert.equal(seatsFull(0, 0), true)
})

test('pending invite text', () => {
  assert.equal(pendingInviteText(0), 'No invites pending')
  assert.equal(pendingInviteText(1), '1 invite pending')
  assert.equal(pendingInviteText(2), '2 invites pending')
})

test('share of pool is bounded and safe with an empty pool', () => {
  assert.equal(shareOfPool(20000, 120340).toFixed(1), '16.6')
  assert.equal(shareOfPool(5, 0), 0)
  assert.equal(shareOfPool(200, 100), 100)
  assert.equal(shareLabel(0, 100), '0%')
  assert.equal(shareLabel(1, 100000), '<0.1%')
  assert.equal(shareLabel(20000, 120340), '16.6%')
})

test('display names fall back to email', () => {
  assert.equal(memberDisplayName({ name: ' Ana ', email: 'ana@acme.com' }), 'Ana')
  assert.equal(memberDisplayName({ name: null, email: 'ben@acme.com' }), 'ben@acme.com')
  assert.equal(teamOwnerLabel('Acme Inc'), "Acme Inc's team")
  assert.equal(teamOwnerLabel(null), 'a team')
})

test('allowance text handles unlimited plans', () => {
  assert.equal(allowanceRemainingText({ remaining: 379660, unlimited: false }), '379,660')
  assert.equal(allowanceRemainingText({ remaining: 0, unlimited: true }), 'Unlimited')
  assert.equal(allowanceQuotaHint({ monthly_quota: 500000, unlimited: false }), 'of 500,000 this month')
  assert.equal(allowanceQuotaHint({ monthly_quota: 0, unlimited: true }), 'No monthly cap on this plan')
  assert.equal(rateLimitText(5000), '5,000/min')
  assert.equal(rateLimitText(0), 'Not set')
})

test('dates format and tolerate bad input', () => {
  assert.equal(formatTeamDate(null), 'Never')
  assert.equal(formatTeamDate('not a date'), 'Never')
  assert.match(formatTeamDate('2026-11-24T18:40:00Z'), /Nov 2\d, 2026/)
  assert.equal(resetsOnText('2026-12-01'), 'Dec 1')
  assert.equal(resetsOnText(null), null)
})

test('closed invite messages cover every status and avoid em dashes', () => {
  for (const status of ['invalid', 'expired', 'revoked', 'accepted', 'unavailable']) {
    const message = closedInviteMessage(status)
    assert.ok(message.title.length > 0)
    assert.ok(message.body.length > 0)
    assert.equal(`${message.title} ${message.body}`.includes('—'), false)
  }
  assert.equal(closedInviteMessage('bogus').title, closedInviteMessage('invalid').title)
})

test('invite subtitle names the inviter and plan when known', () => {
  assert.equal(inviteSubtitle('Acme Inc', 'Plus'), 'Acme Inc invited you to join their team on the Plus plan.')
  assert.equal(inviteSubtitle(null, null), 'You have been invited to join a team.')
  assert.equal(inviteSubtitle(' ', 'Enterprise'), 'You have been invited to join a team on the Enterprise plan.')
})
