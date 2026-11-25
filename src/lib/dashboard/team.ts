export type TeamNavRole = 'owner' | 'member' | 'none'

export const TEAM_PATH = '/dashboard/team'
export const BILLING_PATH = '/dashboard/billing'
const TEAM_NAV_ANCHOR = '/dashboard/usage'

export function showTeamNav(role: TeamNavRole): boolean {
  return role !== 'none'
}

export function showBillingNav(role: TeamNavRole): boolean {
  return role !== 'member'
}

export function accountNavItems<T extends { href: string }>(
  items: T[],
  role: TeamNavRole,
  teamItem: T
): T[] {
  const visible = items.filter(
    (item) => item.href !== TEAM_PATH && (showBillingNav(role) || item.href !== BILLING_PATH)
  )
  if (!showTeamNav(role)) return visible
  const anchor = visible.findIndex((item) => item.href === TEAM_NAV_ANCHOR)
  const at = anchor === -1 ? visible.length : anchor + 1
  return [...visible.slice(0, at), teamItem, ...visible.slice(at)]
}

export function seatText(used: number, limit: number): string {
  const safeUsed = Number.isFinite(used) && used > 0 ? Math.floor(used) : 0
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 0
  return `${safeUsed.toLocaleString('en-US')} of ${safeLimit.toLocaleString('en-US')}`
}

export function pendingInviteText(pending: number): string {
  if (!Number.isFinite(pending) || pending <= 0) return 'No invites pending'
  return pending === 1 ? '1 invite pending' : `${Math.floor(pending)} invites pending`
}

export function seatsFull(used: number, limit: number): boolean {
  if (!Number.isFinite(limit) || limit <= 0) return true
  return Number.isFinite(used) && used >= limit
}

export function shareOfPool(requests: number, poolUsed: number): number {
  if (!Number.isFinite(requests) || !Number.isFinite(poolUsed) || poolUsed <= 0 || requests <= 0) {
    return 0
  }
  return Math.min(100, (requests / poolUsed) * 100)
}

export function shareLabel(requests: number, poolUsed: number): string {
  const pct = shareOfPool(requests, poolUsed)
  if (pct === 0) return '0%'
  if (pct < 0.1) return '<0.1%'
  return `${pct.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`
}

export function memberDisplayName(row: { name?: string | null; email: string }): string {
  const name = (row.name || '').trim()
  return name || row.email
}

export function teamOwnerLabel(ownerDisplayName: string | null | undefined): string {
  const name = (ownerDisplayName || '').trim()
  return name ? `${name}'s team` : 'a team'
}

export function allowanceRemainingText(allowance: {
  remaining: number
  unlimited: boolean
}): string {
  if (allowance.unlimited) return 'Unlimited'
  return Math.max(0, allowance.remaining).toLocaleString('en-US')
}

export function allowanceQuotaHint(allowance: {
  monthly_quota: number
  unlimited: boolean
}): string {
  if (allowance.unlimited) return 'No monthly cap on this plan'
  return `of ${Math.max(0, allowance.monthly_quota).toLocaleString('en-US')} this month`
}

export function rateLimitText(perMinute: number): string {
  if (!Number.isFinite(perMinute) || perMinute <= 0) return 'Not set'
  return `${Math.floor(perMinute).toLocaleString('en-US')}/min`
}

export function formatTeamDate(value: string | null | undefined): string {
  if (!value) return 'Never'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Never'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export type InviteClosedStatus = 'invalid' | 'expired' | 'revoked' | 'accepted' | 'unavailable'

const CLOSED_INVITE_MESSAGES: Record<InviteClosedStatus, { title: string; body: string }> = {
  invalid: {
    title: 'This invite link is not valid',
    body: 'Check that you opened the full link from the email, or ask the team owner for a new one.',
  },
  expired: {
    title: 'This invite has expired',
    body: 'Invite links last 7 days. Ask the team owner to send you a new one.',
  },
  revoked: {
    title: 'This invite was canceled',
    body: 'Ask the team owner to send you a new one.',
  },
  accepted: {
    title: 'This invite was already used',
    body: 'If you joined the team, sign in to see it on your dashboard.',
  },
  unavailable: {
    title: 'This team is not available right now',
    body: 'Team sharing is not active for this team. Ask the team owner.',
  },
}

export function closedInviteMessage(status: InviteClosedStatus): { title: string; body: string } {
  return CLOSED_INVITE_MESSAGES[status] ?? CLOSED_INVITE_MESSAGES.invalid
}

export function inviteSubtitle(inviter: string | null, planName: string | null): string {
  const who = (inviter || '').trim()
  const plan = (planName || '').trim()
  const planPart = plan ? ` on the ${plan} plan` : ''
  return who ? `${who} invited you to join their team${planPart}.` : `You have been invited to join a team${planPart}.`
}

export function resetsOnText(value: string | null | undefined): string | null {
  if (!value) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
