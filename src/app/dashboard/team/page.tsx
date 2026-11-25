'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Activity,
  Gauge,
  LogOut,
  Mail,
  RefreshCw,
  Send,
  Trash2,
  UserMinus,
  Users,
  Zap,
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useTeam } from '@/contexts/TeamContext'
import { ApiError } from '@/types/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TeamConfirmDialog } from '@/components/dashboard/TeamConfirmDialog'
import {
  DASHBOARD_ICON_STROKE,
  DashboardAlert,
  DashboardEmpty,
  DashboardPage,
  DashboardPageHeader,
  DashboardPageSkeleton,
  DashboardPanel,
  DashboardPanelBody,
  DashboardPanelHeader,
  DashboardPill,
  DashboardStatCard,
  DashboardStatList,
  DashboardTable,
  DashboardTableWrap,
  InfoHint,
  RateBar,
} from '@/components/dashboard/dashboard-shell'
import type {
  TeamInviteRow,
  TeamMemberOverview,
  TeamOverview,
  TeamOwnerOverview,
  TeamUsageRow,
} from '@/lib/api/team'
import {
  allowanceQuotaHint,
  allowanceRemainingText,
  formatTeamDate,
  memberDisplayName,
  pendingInviteText,
  rateLimitText,
  resetsOnText,
  seatText,
  seatsFull,
  shareLabel,
  shareOfPool,
  teamOwnerLabel,
} from '@/lib/dashboard/team'

type Notice = { variant: 'success' | 'error'; text: string } | null

function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback
}

function PlanMeta({ planName, paused }: { planName: string | null; paused: boolean }) {
  if (!planName) return null
  return (
    <span className="dashboard-meta-pill" title="Team plan">
      <span
        className={paused ? 'h-1.5 w-1.5 rounded-full bg-amber-500' : 'h-1.5 w-1.5 rounded-full bg-emerald-500'}
        aria-hidden
      />
      {planName}
      <span className="text-dash-dim" aria-hidden>
        ·
      </span>
      <span className="text-dash-muted">{paused ? 'Paused' : 'Active'}</span>
    </span>
  )
}

export default function TeamPage() {
  const { isAuthenticated, loading } = useAuth()
  const team = useTeam()
  const router = useRouter()
  const [overview, setOverview] = useState<TeamOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [unavailable, setUnavailable] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, loading, router])

  const loadOverview = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const { api } = await import('@/lib/api/client')
      const next = await api.team.overview()
      setOverview(next)
      setUnavailable(next === null)
    } catch (err) {
      setOverview(null)
      if (err instanceof ApiError && (err.status === 403 || err.status === 404)) {
        setUnavailable(true)
      } else {
        setError(errorText(err, 'Failed to load your team'))
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (loading || !isAuthenticated || team.loading) return
    if (team.role === 'none') {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setUnavailable(true)
      setIsLoading(false)
      return
    }
    loadOverview()
  }, [loading, isAuthenticated, team.loading, team.role, loadOverview])

  const reload = useCallback(async () => {
    await Promise.all([loadOverview(), team.refresh()])
  }, [loadOverview, team])

  if (loading || team.loading || (isLoading && !overview && !unavailable)) {
    return <DashboardPageSkeleton kpis={3} label="Loading team..." />
  }

  if (!isAuthenticated) return null

  if (unavailable || (!overview && !error)) {
    return (
      <DashboardPage>
        <DashboardPageHeader title="Team" />
        <DashboardPanel>
          <DashboardEmpty
            icon={Users}
            title="Team sharing is not available on this account"
            description="Contact support if you expected to see your team here."
            action={
              <Button asChild variant="outline" size="sm" className="h-9">
                <Link href="/dashboard">Back to overview</Link>
              </Button>
            }
          />
        </DashboardPanel>
      </DashboardPage>
    )
  }

  if (!overview) {
    return (
      <DashboardPage>
        <DashboardPageHeader title="Team" />
        <DashboardAlert variant="error">
          {error}
          <Button variant="outline" size="sm" className="h-8" onClick={loadOverview}>
            Retry
          </Button>
        </DashboardAlert>
      </DashboardPage>
    )
  }

  return overview.role === 'owner' ? (
    <OwnerTeamView overview={overview} loading={isLoading} error={error} onReload={reload} />
  ) : (
    <MemberTeamView overview={overview} loading={isLoading} error={error} onReload={reload} />
  )
}

function RefreshButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={loading} className="h-9 gap-1.5">
      <RefreshCw
        className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
        strokeWidth={DASHBOARD_ICON_STROKE}
      />
      Refresh
    </Button>
  )
}

function OwnerTeamView({
  overview,
  loading,
  error,
  onReload,
}: {
  overview: TeamOwnerOverview
  loading: boolean
  error: string
  onReload: () => Promise<void>
}) {
  const paused = overview.state === 'suspended'
  const full = seatsFull(overview.seats_used, overview.seat_limit)
  const [email, setEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)
  const [busyInviteId, setBusyInviteId] = useState<number | null>(null)
  const [removing, setRemoving] = useState<TeamUsageRow | null>(null)
  const [removeBusy, setRemoveBusy] = useState(false)
  const [removeError, setRemoveError] = useState('')
  const resets = resetsOnText(overview.allowance.resets_on)

  const sendInvite = async (event: React.FormEvent) => {
    event.preventDefault()
    const address = email.trim()
    if (!address || full || paused) return
    try {
      setInviting(true)
      setNotice(null)
      const { api } = await import('@/lib/api/client')
      await api.team.invite(address)
      setEmail('')
      setNotice({ variant: 'success', text: `Invite sent to ${address}.` })
      await onReload()
    } catch (err) {
      setNotice({ variant: 'error', text: errorText(err, 'Could not send the invite') })
    } finally {
      setInviting(false)
    }
  }

  const resendInvite = async (invite: TeamInviteRow) => {
    try {
      setBusyInviteId(invite.id)
      setNotice(null)
      const { api } = await import('@/lib/api/client')
      await api.team.resendInvite(invite.id)
      setNotice({ variant: 'success', text: `A new link was sent to ${invite.email}.` })
      await onReload()
    } catch (err) {
      setNotice({ variant: 'error', text: errorText(err, 'Could not resend the invite') })
    } finally {
      setBusyInviteId(null)
    }
  }

  const cancelInvite = async (invite: TeamInviteRow) => {
    try {
      setBusyInviteId(invite.id)
      setNotice(null)
      const { api } = await import('@/lib/api/client')
      await api.team.cancelInvite(invite.id)
      setNotice({ variant: 'success', text: `Invite to ${invite.email} canceled.` })
      await onReload()
    } catch (err) {
      setNotice({ variant: 'error', text: errorText(err, 'Could not cancel the invite') })
    } finally {
      setBusyInviteId(null)
    }
  }

  const confirmRemove = async () => {
    if (!removing) return
    try {
      setRemoveBusy(true)
      setRemoveError('')
      const { api } = await import('@/lib/api/client')
      await api.team.removeMember(removing.user_id)
      setNotice({ variant: 'success', text: `${removing.email} was removed from the team.` })
      setRemoving(null)
      await onReload()
    } catch (err) {
      setRemoveError(errorText(err, 'Could not remove this member'))
    } finally {
      setRemoveBusy(false)
    }
  }

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Team"
        description="Invite people to share this account's plan and monthly allowance."
        meta={<PlanMeta planName={overview.plan_name} paused={paused} />}
      >
        <RefreshButton loading={loading} onClick={() => void onReload()} />
      </DashboardPageHeader>

      {paused && (
        <DashboardAlert variant="warning">
          Team sharing is paused because this account&apos;s plan does not include team seats.
        </DashboardAlert>
      )}
      {error && <DashboardAlert variant="error">{error}</DashboardAlert>}
      {notice && <DashboardAlert variant={notice.variant}>{notice.text}</DashboardAlert>}

      <div className="dashboard-grid-kpi">
        <DashboardStatCard
          label="Seats"
          value={seatText(overview.seats_used, overview.seat_limit)}
          hint={pendingInviteText(overview.pending_count)}
          icon={Users}
          accent="brand"
          info="You are not counted. Each member and each pending invite uses one seat."
        />
        <DashboardStatCard
          label="Allowance remaining"
          value={allowanceRemainingText(overview.allowance)}
          hint={allowanceQuotaHint(overview.allowance)}
          icon={Gauge}
          accent="indigo"
        />
        <DashboardStatCard
          label="Rate limit"
          value={rateLimitText(overview.allowance.rate_limit_per_minute)}
          hint="Shared by the whole team"
          icon={Zap}
          accent="orange"
        />
      </div>

      {!paused && (
        <DashboardPanel>
          <DashboardPanelHeader
            title="Invite a member"
            icon={Mail}
            actions={
              <InfoHint text="The link works once and expires in 7 days. A pending invite uses a seat." />
            }
          />
          <DashboardPanelBody>
            <form onSubmit={sendInvite} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <label htmlFor="team-invite-email" className="dashboard-field-label">
                  Email address
                </label>
                <Input
                  id="team-invite-email"
                  type="email"
                  autoComplete="off"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={full || inviting}
                  placeholder="name@company.com"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="h-10 gap-1.5"
                disabled={full || inviting || !email.trim()}
              >
                <Send className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                {inviting ? 'Sending...' : 'Send invite'}
              </Button>
            </form>
            {full && (
              <p className="dashboard-field-hint mt-2">
                All seats are in use. Remove a member or cancel a pending invite first.
              </p>
            )}
          </DashboardPanelBody>
        </DashboardPanel>
      )}

      <DashboardPanel>
        <DashboardPanelHeader
          title="Usage by member"
          icon={Activity}
          description={resets ? `Requests this month. Resets ${resets}.` : 'Requests this month.'}
        />
        {overview.usage.length === 0 ? (
          <DashboardEmpty icon={Activity} title="No usage yet" className="py-8" />
        ) : (
          <DashboardPanelBody flush>
            <DashboardTableWrap>
              <DashboardTable>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Role</th>
                    <th className="dashboard-num">Requests</th>
                    <th>Share of pool</th>
                    <th>Last request</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {overview.usage.map((row) => (
                    <tr key={row.user_id}>
                      <td className="max-w-[260px]">
                        <p className="truncate font-medium text-dash-ink">{memberDisplayName(row)}</p>
                        {row.name && <p className="truncate text-xs text-dash-muted">{row.email}</p>}
                      </td>
                      <td>
                        <span className="flex flex-wrap items-center gap-1.5">
                          <DashboardPill tone={row.role === 'owner' ? 'indigo' : 'neutral'}>
                            {row.role === 'owner' ? 'Owner' : 'Member'}
                          </DashboardPill>
                          {row.status === 'removed' && <DashboardPill tone="rose">Removed</DashboardPill>}
                        </span>
                      </td>
                      <td className="dashboard-num font-medium text-dash-ink">
                        {row.requests.toLocaleString()}
                      </td>
                      <td className="min-w-[140px]">
                        <RateBar
                          value={shareOfPool(row.requests, overview.allowance.used)}
                          label={shareLabel(row.requests, overview.allowance.used)}
                        />
                      </td>
                      <td className="whitespace-nowrap text-xs text-dash-muted">
                        {formatTeamDate(row.last_request_at)}
                      </td>
                      <td className="text-right">
                        {row.role === 'member' && row.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 text-dash-negative hover:bg-dash-negative-soft hover:text-dash-negative"
                            onClick={() => {
                              setRemoveError('')
                              setRemoving(row)
                            }}
                          >
                            <UserMinus className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                            Remove
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </DashboardTable>
            </DashboardTableWrap>
          </DashboardPanelBody>
        )}
      </DashboardPanel>

      <DashboardPanel>
        <DashboardPanelHeader title="Pending invites" icon={Mail} />
        {overview.invites.length === 0 ? (
          <DashboardEmpty icon={Mail} title="No pending invites" className="py-8" />
        ) : (
          <DashboardPanelBody flush>
            <DashboardTableWrap>
              <DashboardTable>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Sent</th>
                    <th>Expires</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {overview.invites.map((invite) => (
                    <tr key={invite.id}>
                      <td className="max-w-[260px] truncate font-medium text-dash-ink">{invite.email}</td>
                      <td className="whitespace-nowrap text-xs text-dash-muted">
                        {formatTeamDate(invite.created_at)}
                      </td>
                      <td className="whitespace-nowrap text-xs text-dash-muted">
                        {formatTeamDate(invite.expires_at)}
                      </td>
                      <td className="text-right">
                        <span className="inline-flex flex-wrap justify-end gap-2">
                          {!paused && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1.5"
                              disabled={busyInviteId === invite.id}
                              onClick={() => resendInvite(invite)}
                            >
                              <Send className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                              Resend
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 text-dash-negative hover:bg-dash-negative-soft hover:text-dash-negative"
                            disabled={busyInviteId === invite.id}
                            onClick={() => cancelInvite(invite)}
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                            Cancel
                          </Button>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </DashboardTable>
            </DashboardTableWrap>
          </DashboardPanelBody>
        )}
      </DashboardPanel>

      <TeamConfirmDialog
        open={removing !== null}
        title={removing ? `Remove ${removing.email}?` : 'Remove member?'}
        warning={
          <p>
            Their API keys stop working right away. Their usage this month stays in your history.
          </p>
        }
        confirmLabel="Remove"
        busyLabel="Removing..."
        busy={removeBusy}
        error={removeError}
        onOpenChange={(open) => {
          if (!open) setRemoving(null)
        }}
        onConfirm={confirmRemove}
      />
    </DashboardPage>
  )
}

function MemberTeamView({
  overview,
  loading,
  error,
  onReload,
}: {
  overview: TeamMemberOverview
  loading: boolean
  error: string
  onReload: () => Promise<void>
}) {
  const router = useRouter()
  const team = useTeam()
  const paused = overview.state === 'suspended'
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [leaveError, setLeaveError] = useState('')
  const teamLabel = teamOwnerLabel(overview.owner_display_name)
  const planLabel = overview.plan_name ? `${overview.plan_name} ` : ''

  const leave = async () => {
    try {
      setLeaving(true)
      setLeaveError('')
      const { api } = await import('@/lib/api/client')
      await api.team.leave()
      await team.refresh()
      setConfirmLeave(false)
      router.push('/dashboard')
    } catch (err) {
      setLeaveError(errorText(err, 'Could not leave the team'))
      setLeaving(false)
    }
  }

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Team"
        description="Your team membership and the allowance you share."
        meta={<PlanMeta planName={overview.plan_name} paused={paused} />}
      >
        <RefreshButton loading={loading} onClick={() => void onReload()} />
      </DashboardPageHeader>

      {paused && (
        <DashboardAlert variant="warning">
          Team sharing is paused. Your keys run on Free plan limits until the team&apos;s plan is
          active again.
        </DashboardAlert>
      )}
      {error && <DashboardAlert variant="error">{error}</DashboardAlert>}

      <div className="dashboard-grid-kpi">
        <DashboardStatCard
          label="Your requests this month"
          value={overview.my_requests_this_month.toLocaleString()}
          hint="Calls made with your API keys"
          icon={Activity}
          accent="brand"
        />
        <DashboardStatCard
          label="Team allowance remaining"
          value={allowanceRemainingText(overview.allowance)}
          hint={allowanceQuotaHint(overview.allowance)}
          icon={Gauge}
          accent="indigo"
        />
        <DashboardStatCard
          label="Rate limit (shared)"
          value={rateLimitText(overview.allowance.rate_limit_per_minute)}
          hint="Shared by the whole team"
          icon={Zap}
          accent="orange"
        />
      </div>

      <DashboardPanel>
        <DashboardPanelHeader
          title="Membership"
          icon={Users}
          actions={
            <InfoHint text="The team owner manages the plan and billing. Removing you or leaving revokes your API keys." />
          }
        />
        <DashboardPanelBody>
          <p className="text-[13px] leading-5 text-dash-ink">
            You are on {teamLabel}. Your API keys use the team&apos;s {planLabel}allowance.
          </p>
          <DashboardStatList
            className="mt-4"
            items={[
              { label: 'Team', value: overview.owner_display_name || 'Team owner' },
              { label: 'Plan', value: overview.plan_name || 'Not set' },
              { label: 'Joined', value: formatTeamDate(overview.joined_at) },
            ]}
          />
        </DashboardPanelBody>
        <div className="flex flex-wrap gap-2 border-t border-dash-border px-5 py-4">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-dash-negative hover:bg-dash-negative-soft hover:text-dash-negative"
            onClick={() => {
              setLeaveError('')
              setConfirmLeave(true)
            }}
          >
            <LogOut className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
            Leave team
          </Button>
        </div>
      </DashboardPanel>

      <TeamConfirmDialog
        open={confirmLeave}
        title="Leave this team?"
        warning={<p>Your API keys will be revoked and your account returns to the Free plan.</p>}
        confirmLabel="Leave team"
        busyLabel="Leaving..."
        busy={leaving}
        error={leaveError}
        onOpenChange={setConfirmLeave}
        onConfirm={leave}
      />
    </DashboardPage>
  )
}
