export type TeamRole = 'owner' | 'member' | 'none'
export type TeamState = 'active' | 'suspended' | null
export type TeamMemberStatus = 'active' | 'removed'
export type TeamInviteStatus = 'valid' | 'expired' | 'revoked' | 'accepted' | 'unavailable'

export interface TeamMe {
  role: TeamRole
  team_available: boolean
  state: TeamState
  plan_name: string | null
  seat_limit: number
  seats_used: number
  owner_display_name: string | null
}

export interface TeamAllowance {
  monthly_quota: number
  used: number
  remaining: number
  rate_limit_per_minute: number
  resets_on: string | null
  unlimited: boolean
}

export interface TeamUsageRow {
  user_id: number
  name: string | null
  email: string
  role: 'owner' | 'member'
  status: TeamMemberStatus
  requests: number
  last_request_at: string | null
  joined_at: string | null
  removed_at: string | null
}

export interface TeamInviteRow {
  id: number
  email: string
  created_at: string | null
  expires_at: string | null
  send_count: number
}

export interface TeamOwnerOverview {
  role: 'owner'
  state: TeamState
  plan_name: string | null
  seat_limit: number
  seats_used: number
  members_count: number
  pending_count: number
  allowance: TeamAllowance
  usage: TeamUsageRow[]
  invites: TeamInviteRow[]
}

export interface TeamMemberOverview {
  role: 'member'
  state: TeamState
  owner_display_name: string | null
  plan_name: string | null
  joined_at: string | null
  my_requests_this_month: number
  allowance: TeamAllowance
}

export type TeamOverview = TeamOwnerOverview | TeamMemberOverview

export interface TeamInviteResult {
  invite: TeamInviteRow | null
  seat_limit: number
  seats_used: number
}

export interface TeamMessageResult {
  message: string
  keys_revoked: number
}

export interface TeamInvitePreview {
  status: TeamInviteStatus
  inviter_display_name: string | null
  plan_name: string | null
  email_hint: string | null
  expires_at: string | null
}

export interface TeamAcceptResult {
  message: string
  owner_display_name: string | null
  plan_name: string | null
}

export const NO_TEAM: TeamMe = {
  role: 'none',
  team_available: false,
  state: null,
  plan_name: null,
  seat_limit: 0,
  seats_used: 0,
  owner_display_name: null,
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function text(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function count(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

export function normalizeTeamRole(value: unknown): TeamRole {
  return value === 'owner' || value === 'member' ? value : 'none'
}

export function normalizeTeamState(value: unknown): TeamState {
  return value === 'active' || value === 'suspended' ? value : null
}

export function normalizeTeamMe(payload: unknown): TeamMe {
  const row = record(payload)
  const role = normalizeTeamRole(row.role)
  return {
    role,
    team_available: role === 'owner' && row.team_available === true,
    state: role === 'none' ? null : normalizeTeamState(row.state),
    plan_name: text(row.plan_name),
    seat_limit: count(row.seat_limit),
    seats_used: count(row.seats_used),
    owner_display_name: text(row.owner_display_name),
  }
}

export function normalizeAllowance(payload: unknown): TeamAllowance {
  const row = record(payload)
  const quota = count(row.monthly_quota)
  const used = count(row.used)
  const remaining =
    row.remaining === undefined || row.remaining === null
      ? Math.max(0, quota - used)
      : count(row.remaining)
  return {
    monthly_quota: quota,
    used,
    remaining,
    rate_limit_per_minute: count(row.rate_limit_per_minute),
    resets_on: text(row.resets_on),
    unlimited: row.unlimited === true,
  }
}

export function normalizeUsageRow(payload: unknown): TeamUsageRow | null {
  const row = record(payload)
  const userId = count(row.user_id)
  const email = text(row.email)
  if (!userId || !email) return null
  return {
    user_id: userId,
    name: text(row.name),
    email,
    role: row.role === 'owner' ? 'owner' : 'member',
    status: row.status === 'removed' ? 'removed' : 'active',
    requests: count(row.requests),
    last_request_at: text(row.last_request_at),
    joined_at: text(row.joined_at),
    removed_at: text(row.removed_at),
  }
}

export function normalizeInviteRow(payload: unknown): TeamInviteRow | null {
  const row = record(payload)
  const id = count(row.id)
  const email = text(row.email)
  if (!id || !email) return null
  return {
    id,
    email,
    created_at: text(row.created_at),
    expires_at: text(row.expires_at),
    send_count: count(row.send_count),
  }
}

export function normalizeTeamOverview(payload: unknown): TeamOverview | null {
  const row = record(payload)
  const state = normalizeTeamState(row.state)
  const allowance = normalizeAllowance(row.allowance)
  if (row.role === 'owner') {
    const usage = list(row.usage)
      .map(normalizeUsageRow)
      .filter((item): item is TeamUsageRow => item !== null)
    const invites = list(row.invites)
      .map(normalizeInviteRow)
      .filter((item): item is TeamInviteRow => item !== null)
    const membersCount =
      row.members_count === undefined
        ? usage.filter((item) => item.role === 'member' && item.status === 'active').length
        : count(row.members_count)
    const pendingCount = row.pending_count === undefined ? invites.length : count(row.pending_count)
    return {
      role: 'owner',
      state,
      plan_name: text(row.plan_name),
      seat_limit: count(row.seat_limit),
      seats_used: row.seats_used === undefined ? membersCount + pendingCount : count(row.seats_used),
      members_count: membersCount,
      pending_count: pendingCount,
      allowance,
      usage,
      invites,
    }
  }
  if (row.role === 'member') {
    return {
      role: 'member',
      state,
      owner_display_name: text(row.owner_display_name),
      plan_name: text(row.plan_name),
      joined_at: text(row.joined_at),
      my_requests_this_month: count(row.my_requests_this_month),
      allowance,
    }
  }
  return null
}

export function normalizeInviteResult(payload: unknown): TeamInviteResult {
  const row = record(payload)
  return {
    invite: normalizeInviteRow(row.invite),
    seat_limit: count(row.seat_limit),
    seats_used: count(row.seats_used),
  }
}

export function normalizeMessageResult(payload: unknown): TeamMessageResult {
  const row = record(payload)
  return {
    message: text(row.message) ?? '',
    keys_revoked: count(row.keys_revoked),
  }
}

const INVITE_STATUSES: TeamInviteStatus[] = ['valid', 'expired', 'revoked', 'accepted', 'unavailable']

export function normalizeInvitePreview(payload: unknown): TeamInvitePreview {
  const row = record(payload)
  const status = INVITE_STATUSES.find((item) => item === row.status) ?? 'unavailable'
  return {
    status,
    inviter_display_name: text(row.inviter_display_name),
    plan_name: text(row.plan_name),
    email_hint: text(row.email_hint),
    expires_at: text(row.expires_at),
  }
}

export function normalizeAcceptResult(payload: unknown): TeamAcceptResult {
  const row = record(payload)
  return {
    message: text(row.message) ?? '',
    owner_display_name: text(row.owner_display_name),
    plan_name: text(row.plan_name),
  }
}

export function teamAcceptPath(token: string): string {
  return `/team/accept?token=${encodeURIComponent(token)}`
}

export interface TeamHttpClient {
  get<T>(endpoint: string, params?: Record<string, unknown>): Promise<{ data: T }>
  post<T>(endpoint: string, data?: unknown): Promise<{ data: T }>
  delete<T>(endpoint: string): Promise<{ data: T }>
}

const TEAM_BASE = '/api/v1/team'

export function createTeamApi(client: TeamHttpClient) {
  return {
    async me(): Promise<TeamMe> {
      const res = await client.get<unknown>(`${TEAM_BASE}/me`)
      return normalizeTeamMe(res.data)
    },
    async overview(): Promise<TeamOverview | null> {
      const res = await client.get<unknown>(`${TEAM_BASE}/overview`)
      return normalizeTeamOverview(res.data)
    },
    async invite(email: string): Promise<TeamInviteResult> {
      const res = await client.post<unknown>(`${TEAM_BASE}/invites`, { email: email.trim() })
      return normalizeInviteResult(res.data)
    },
    async resendInvite(inviteId: number): Promise<TeamInviteResult> {
      const res = await client.post<unknown>(`${TEAM_BASE}/invites/${inviteId}/resend`)
      return normalizeInviteResult(res.data)
    },
    async cancelInvite(inviteId: number): Promise<TeamMessageResult> {
      const res = await client.delete<unknown>(`${TEAM_BASE}/invites/${inviteId}`)
      return normalizeMessageResult(res.data)
    },
    async removeMember(memberUserId: number): Promise<TeamMessageResult> {
      const res = await client.delete<unknown>(`${TEAM_BASE}/members/${memberUserId}`)
      return normalizeMessageResult(res.data)
    },
    async leave(): Promise<TeamMessageResult> {
      const res = await client.post<unknown>(`${TEAM_BASE}/leave`)
      return normalizeMessageResult(res.data)
    },
    async previewInvite(token: string): Promise<TeamInvitePreview> {
      const res = await client.get<unknown>(`${TEAM_BASE}/invites/preview`, { token })
      return normalizeInvitePreview(res.data)
    },
    async acceptInvite(token: string): Promise<TeamAcceptResult> {
      const res = await client.post<unknown>(`${TEAM_BASE}/invites/accept`, { token })
      return normalizeAcceptResult(res.data)
    },
  }
}

export type TeamApi = ReturnType<typeof createTeamApi>
