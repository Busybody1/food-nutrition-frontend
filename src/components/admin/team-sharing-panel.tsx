'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Users } from 'lucide-react'
import { adminAPI, type AdminUserTeam } from '@/lib/api/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { TeamConfirmDialog } from '@/components/dashboard/TeamConfirmDialog'
import { formatTeamDate, seatText } from '@/lib/dashboard/team'
import {
  AdminDetailGrid,
  AdminPanel,
  AdminPanelBody,
  AdminPanelHeader,
  AdminTable,
  AdminTableWrap,
  DashboardAlert,
  DashboardPill,
  InfoHint,
} from '@/components/admin/admin-ui'

const OVERRIDE_MIN = 1
const OVERRIDE_MAX = 500

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}

function roleLabel(team: AdminUserTeam): string {
  if (team.role === 'owner') return team.state === 'suspended' ? 'Owner (paused)' : 'Owner'
  if (team.role === 'member') return team.state === 'suspended' ? 'Member (paused)' : 'Member'
  return 'Not on a team'
}

export function TeamSharingPanel({ userId }: { userId: number }) {
  const [team, setTeam] = useState<AdminUserTeam | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [confirmOff, setConfirmOff] = useState(false)
  const [overrideDraft, setOverrideDraft] = useState('')

  const applyTeam = useCallback((next: AdminUserTeam | null) => {
    setTeam(next)
    setOverrideDraft(next?.seat_limit_override == null ? '' : String(next.seat_limit_override))
  }, [])

  const load = useCallback(async () => {
    const next = await adminAPI.getUserTeam(userId).catch(() => null)
    applyTeam(next)
    setLoaded(true)
  }, [userId, applyTeam])

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    load()
  }, [load])

  if (!loaded || !team) return null

  const noSeats = team.plan_team_seat_limit <= 0
  const switchDisabled = busy || (noSeats && !team.team_sharing_enabled)

  const update = async (
    body: { enabled?: boolean; seat_limit_override?: number | null },
    describe: (next: AdminUserTeam) => string
  ) => {
    try {
      setBusy(true)
      setError('')
      setSuccess('')
      const next = await adminAPI.setUserTeamSharing(userId, body)
      applyTeam(next)
      setSuccess(describe(next))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update team sharing')
      return false
    } finally {
      setBusy(false)
    }
  }

  const enable = () =>
    update({ enabled: true }, () => 'Team sharing is on for this account.')

  const disable = async () => {
    const ok = await update({ enabled: false }, (next) => {
      const result = next.result
      if (!result) return 'Team sharing is off for this account.'
      return `Team sharing is off. ${plural(result.members_ended, 'member')} removed, ${plural(
        result.keys_revoked,
        'key'
      )} revoked, ${plural(result.invites_revoked, 'invite')} canceled.`
    })
    if (ok) setConfirmOff(false)
  }

  const saveOverride = () => {
    const raw = overrideDraft.trim()
    let value: number | null = null
    if (raw) {
      const parsed = Number(raw)
      if (!Number.isInteger(parsed) || parsed < OVERRIDE_MIN || parsed > OVERRIDE_MAX) {
        setSuccess('')
        setError(`Override must be a whole number from ${OVERRIDE_MIN} to ${OVERRIDE_MAX}, or empty to clear it.`)
        return
      }
      value = parsed
    }
    void update({ seat_limit_override: value }, (next) =>
      next.seat_limit_override == null
        ? 'Seat override cleared.'
        : `Seat override set to ${next.seat_limit_override}.`
    )
  }

  const overrideDirty =
    overrideDraft.trim() !== (team.seat_limit_override == null ? '' : String(team.seat_limit_override))

  return (
    <AdminPanel>
      <AdminPanelHeader
        title="Team sharing"
        icon={Users}
        actions={
          <InfoHint text="Two gates are required: the plan must include team seats and this switch must be on. Turning it off ends every membership, revokes members' API keys and cancels pending invites." />
        }
      />
      <AdminPanelBody className="space-y-5">
        {error && <DashboardAlert variant="error">{error}</DashboardAlert>}
        {success && <DashboardAlert variant="success">{success}</DashboardAlert>}

        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-dash-ink">
              {team.team_sharing_enabled ? 'On for this account' : 'Off for this account'}
            </p>
            {noSeats && (
              <p className="mt-0.5 text-xs text-dash-muted">This plan does not include team seats.</p>
            )}
          </div>
          <Switch
            checked={team.team_sharing_enabled}
            disabled={switchDisabled}
            aria-label="Team sharing"
            onCheckedChange={(next) => {
              if (next) void enable()
              else setConfirmOff(true)
            }}
          />
        </div>

        <AdminDetailGrid
          items={[
            { label: 'Plan', value: team.plan_name || 'No plan' },
            { label: 'Role', value: roleLabel(team) },
            { label: 'Plan seat cap', value: String(team.plan_team_seat_limit) },
            {
              label: 'Override',
              value: team.seat_limit_override == null ? 'None' : String(team.seat_limit_override),
            },
            { label: 'Effective cap', value: String(team.effective_seat_limit) },
            { label: 'Seats used', value: seatText(team.seats_used, team.effective_seat_limit) },
          ]}
        />

        {team.override_allowed && (
          <div>
            <div className="flex items-center gap-1.5">
              <label htmlFor="team-seat-override" className="dashboard-field-label mb-0">
                Seat override
              </label>
              <InfoHint text="Raises the seat cap for this account only. It applies while the account is on an Enterprise or Custom plan and can only raise the cap. Leave empty to use the plan cap." />
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Input
                id="team-seat-override"
                type="number"
                min={OVERRIDE_MIN}
                max={OVERRIDE_MAX}
                value={overrideDraft}
                onChange={(event) => setOverrideDraft(event.target.value)}
                disabled={busy}
                placeholder="Plan cap"
                className="h-9 w-32"
              />
              <Button
                type="button"
                size="sm"
                className="h-9"
                disabled={busy || !overrideDirty}
                onClick={saveOverride}
              >
                Save
              </Button>
            </div>
          </div>
        )}

        {team.member_of && (
          <div className="rounded-xl bg-dash-hover px-4 py-3 text-[13px]">
            <p className="text-xs text-dash-muted">Member of</p>
            <Link
              href={`/admin/users/${team.member_of.owner_user_id}`}
              className="mt-0.5 inline-block font-medium text-dash-ink underline-offset-2 hover:underline"
            >
              {team.member_of.owner_display_name || team.member_of.owner_email}
            </Link>
            <p className="mt-0.5 text-xs text-dash-muted">
              {team.member_of.owner_email} · joined {formatTeamDate(team.member_of.joined_at)}
            </p>
          </div>
        )}
      </AdminPanelBody>

      {team.members.length > 0 && (
        <AdminPanelBody noPadding className="border-t border-dash-border">
          <AdminTableWrap>
            <AdminTable>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {team.members.map((member) => (
                  <tr key={member.user_id}>
                    <td className="max-w-[260px]">
                      <Link
                        href={`/admin/users/${member.user_id}`}
                        className="block truncate font-medium text-dash-ink hover:underline"
                      >
                        {member.name || member.email}
                      </Link>
                      {member.name && <p className="truncate text-xs text-dash-muted">{member.email}</p>}
                    </td>
                    <td className="whitespace-nowrap text-xs text-dash-muted">
                      {formatTeamDate(member.joined_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
          </AdminTableWrap>
        </AdminPanelBody>
      )}

      {team.invites.length > 0 && (
        <AdminPanelBody noPadding className="border-t border-dash-border">
          <AdminTableWrap>
            <AdminTable>
              <thead>
                <tr>
                  <th>Pending invite</th>
                  <th>Sent</th>
                  <th>Expires</th>
                  <th className="dashboard-num">Sends</th>
                </tr>
              </thead>
              <tbody>
                {team.invites.map((invite) => (
                  <tr key={invite.id}>
                    <td className="max-w-[260px] truncate font-medium text-dash-ink">
                      <span className="inline-flex items-center gap-2">
                        {invite.email}
                        <DashboardPill tone="orange">Pending</DashboardPill>
                      </span>
                    </td>
                    <td className="whitespace-nowrap text-xs text-dash-muted">
                      {formatTeamDate(invite.created_at)}
                    </td>
                    <td className="whitespace-nowrap text-xs text-dash-muted">
                      {formatTeamDate(invite.expires_at)}
                    </td>
                    <td className="dashboard-num">{invite.send_count}</td>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
          </AdminTableWrap>
        </AdminPanelBody>
      )}

      <TeamConfirmDialog
        open={confirmOff}
        title="Turn off team sharing?"
        description="The change is written to the audit log."
        warning={
          <p>
            {plural(team.members.length, 'member')} will be removed and their API keys revoked.{' '}
            {plural(team.invites.length, 'pending invite')} will be canceled.
          </p>
        }
        confirmLabel="Turn off"
        busyLabel="Turning off..."
        busy={busy}
        error={confirmOff ? error : ''}
        onOpenChange={setConfirmOff}
        onConfirm={disable}
      />
    </AdminPanel>
  )
}
