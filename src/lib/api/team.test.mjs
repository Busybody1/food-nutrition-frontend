import assert from 'node:assert/strict'
import test from 'node:test'
import {
  NO_TEAM,
  createTeamApi,
  normalizeAllowance,
  normalizeInvitePreview,
  normalizeInviteResult,
  normalizeMessageResult,
  normalizeTeamMe,
  normalizeTeamOverview,
  teamAcceptPath,
} from './team.ts'

test('normalizeTeamMe falls back to no team for junk', () => {
  assert.deepEqual(normalizeTeamMe(null), NO_TEAM)
  assert.deepEqual(normalizeTeamMe({ role: 'admin' }), NO_TEAM)
  assert.equal(normalizeTeamMe({ role: 'none', state: 'active' }).state, null)
})

test('normalizeTeamMe keeps owner and member fields', () => {
  const owner = normalizeTeamMe({
    role: 'owner',
    team_available: true,
    state: 'active',
    plan_name: 'Plus',
    seat_limit: 3,
    seats_used: 2,
    owner_display_name: null,
  })
  assert.equal(owner.role, 'owner')
  assert.equal(owner.team_available, true)
  assert.equal(owner.seat_limit, 3)
  assert.equal(owner.seats_used, 2)

  const member = normalizeTeamMe({
    role: 'member',
    team_available: true,
    state: 'suspended',
    owner_display_name: ' Acme Inc ',
  })
  assert.equal(member.role, 'member')
  assert.equal(member.team_available, false)
  assert.equal(member.state, 'suspended')
  assert.equal(member.owner_display_name, 'Acme Inc')
})

test('normalizeAllowance derives remaining and keeps the unlimited flag', () => {
  const allowance = normalizeAllowance({ monthly_quota: 500000, used: 120340, rate_limit_per_minute: 5000 })
  assert.equal(allowance.remaining, 379660)
  assert.equal(allowance.unlimited, false)
  assert.equal(normalizeAllowance({ monthly_quota: 10, used: 40 }).remaining, 0)
  assert.equal(normalizeAllowance({ unlimited: true }).unlimited, true)
  assert.equal(normalizeAllowance({ remaining: -5 }).remaining, 0)
})

test('normalizeTeamOverview reads the owner shape', () => {
  const overview = normalizeTeamOverview({
    role: 'owner',
    state: 'active',
    plan_name: 'Plus',
    seat_limit: 3,
    members_count: 1,
    pending_count: 1,
    allowance: { monthly_quota: 500000, used: 120340, remaining: 379660, rate_limit_per_minute: 5000, resets_on: '2026-12-01' },
    usage: [
      { user_id: 12, name: 'Ana Kovac', email: 'ana@acme.com', role: 'owner', status: 'active', requests: 100000 },
      { user_id: 40, name: null, email: 'ben@acme.com', role: 'member', status: 'active', requests: 20000, joined_at: '2026-11-03T10:00:00Z' },
      { user_id: 51, email: 'old@acme.com', role: 'member', status: 'removed', requests: 340, removed_at: '2026-11-10T08:00:00Z' },
      { user_id: 0, email: 'bad@acme.com' },
    ],
    invites: [{ id: 9, email: 'new@acme.com', send_count: 1 }, { id: 'x' }],
  })
  assert.equal(overview.role, 'owner')
  assert.equal(overview.usage.length, 3)
  assert.equal(overview.usage[2].status, 'removed')
  assert.equal(overview.usage[1].joined_at, '2026-11-03T10:00:00Z')
  assert.equal(overview.invites.length, 1)
  assert.equal(overview.seats_used, 2)
  assert.equal(overview.allowance.resets_on, '2026-12-01')
})

test('normalizeTeamOverview counts seats when the server omits them', () => {
  const overview = normalizeTeamOverview({
    role: 'owner',
    usage: [
      { user_id: 1, email: 'o@x.com', role: 'owner', status: 'active' },
      { user_id: 2, email: 'a@x.com', role: 'member', status: 'active' },
      { user_id: 3, email: 'b@x.com', role: 'member', status: 'removed' },
    ],
    invites: [{ id: 4, email: 'c@x.com' }],
  })
  assert.equal(overview.members_count, 1)
  assert.equal(overview.pending_count, 1)
  assert.equal(overview.seats_used, 2)
})

test('normalizeTeamOverview reads the member shape without other members', () => {
  const overview = normalizeTeamOverview({
    role: 'member',
    state: 'active',
    owner_display_name: 'Acme Inc',
    plan_name: 'Plus',
    joined_at: '2026-11-03T10:00:00Z',
    my_requests_this_month: 20000,
    allowance: { monthly_quota: 500000, used: 120340 },
    usage: [{ user_id: 12, email: 'ana@acme.com' }],
  })
  assert.equal(overview.role, 'member')
  assert.equal(overview.my_requests_this_month, 20000)
  assert.equal('usage' in overview, false)
})

test('normalizeTeamOverview returns null for no role', () => {
  assert.equal(normalizeTeamOverview({ role: 'none' }), null)
  assert.equal(normalizeTeamOverview(undefined), null)
})

test('invite preview status falls back to unavailable', () => {
  assert.equal(normalizeInvitePreview({ status: 'valid' }).status, 'valid')
  assert.equal(normalizeInvitePreview({ status: 'weird' }).status, 'unavailable')
  assert.equal(normalizeInvitePreview({ status: 'expired', email_hint: 'b***@acme.com' }).email_hint, 'b***@acme.com')
})

test('invite and message results normalise', () => {
  const result = normalizeInviteResult({ invite: { id: 3, email: 'x@y.com', send_count: 2 }, seat_limit: 3, seats_used: 1 })
  assert.equal(result.invite.id, 3)
  assert.equal(result.seats_used, 1)
  assert.equal(normalizeInviteResult({}).invite, null)
  assert.deepEqual(normalizeMessageResult({ message: 'Removed.', keys_revoked: 2 }), { message: 'Removed.', keys_revoked: 2 })
})

test('teamAcceptPath encodes the token', () => {
  assert.equal(teamAcceptPath('a b&c'), '/team/accept?token=a%20b%26c')
})

test('createTeamApi calls the documented endpoints', async () => {
  const calls = []
  const client = {
    async get(endpoint, params) {
      calls.push(['GET', endpoint, params])
      return { data: { role: 'owner', status: 'valid' } }
    },
    async post(endpoint, data) {
      calls.push(['POST', endpoint, data])
      return { data: {} }
    },
    async delete(endpoint) {
      calls.push(['DELETE', endpoint])
      return { data: { message: 'ok' } }
    },
  }
  const team = createTeamApi(client)
  await team.me()
  await team.overview()
  await team.invite('  new@acme.com ')
  await team.resendInvite(9)
  await team.cancelInvite(9)
  await team.removeMember(40)
  await team.leave()
  await team.previewInvite('tok')
  await team.acceptInvite('tok')
  assert.deepEqual(calls, [
    ['GET', '/api/v1/team/me', undefined],
    ['GET', '/api/v1/team/overview', undefined],
    ['POST', '/api/v1/team/invites', { email: 'new@acme.com' }],
    ['POST', '/api/v1/team/invites/9/resend', undefined],
    ['DELETE', '/api/v1/team/invites/9'],
    ['DELETE', '/api/v1/team/members/40'],
    ['POST', '/api/v1/team/leave', undefined],
    ['GET', '/api/v1/team/invites/preview', { token: 'tok' }],
    ['POST', '/api/v1/team/invites/accept', { token: 'tok' }],
  ])
})
