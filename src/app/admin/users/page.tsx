'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Eye, Ban, CheckCircle, Mail, Calendar,
  Users, RotateCcw, Trash2, KeyRound, AtSign, Layers, Activity,
  ArrowDown, ArrowUp, ChevronsUpDown,
} from 'lucide-react'
import {
  adminAPI,
  AdminUser,
  AdminUserStats,
  AdminPlan,
  UserSortKey,
  SortOrder,
} from '@/lib/api/admin'
import { DeleteUserDialog } from '@/components/admin/delete-user-dialog'
import { ResetUserPasswordDialog } from '@/components/admin/reset-user-password-dialog'
import {
  BanEmailDomainDialog,
  BannedEmailDomainsPanel,
  emailDomainLabel,
} from '@/components/admin/banned-email-domains'
import { useAdmin } from '@/lib/hooks/use-admin'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCount } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import {
  AdminPage,
  AdminPageHeader,
  AdminStatGrid,
  DashboardStatCard,
  AdminPanel,
  AdminPanelHeader,
  AdminPanelBody,
  AdminTableWrap,
  AdminTable,
  AdminSortableTh,
  AdminPagination,
  AdminSortState,
  AdminRefreshButton,
  AdminSkeletonStats,
  DashboardLoading,
  DashboardAlert,
  DashboardEmpty,
  DashboardPanelToolbar,
  DashboardPill,
  DashboardSearchInput,
  DashboardStatList,
  DeltaPill,
  DASHBOARD_ICON_STROKE,
  type DashboardTone,
} from '@/components/admin/admin-ui'

type StatusFilter = 'all' | 'active' | 'inactive' | 'admin' | 'unverified'

const SEARCH_DEBOUNCE_MS = 300
const DEFAULT_PAGE_SIZE = 20

const SORT_PRESETS: Array<{ value: string; label: string }> = [
  { value: 'created_at-desc', label: 'Newest first' },
  { value: 'created_at-asc', label: 'Oldest first' },
  { value: 'last_login-desc', label: 'Recently active' },
  { value: 'total_requests-desc', label: 'Most requests' },
  { value: 'total_requests-asc', label: 'Fewest requests' },
  { value: 'requests_this_month-desc', label: 'Most requests (month)' },
  { value: 'email-asc', label: 'Email A–Z' },
  { value: 'email-desc', label: 'Email Z–A' },
]

function planTone(planName: string): DashboardTone {
  switch (planName.toLowerCase()) {
    case 'free':
      return 'neutral'
    case 'basic':
    case 'enterprise basic':
      return 'brand'
    case 'core':
    case 'enterprise core':
      return 'green'
    case 'plus':
    case 'enterprise plus':
      return 'indigo'
    case 'custom':
    case 'enterprise':
      return 'orange'
    default:
      return 'neutral'
  }
}

function SortToggle({
  label,
  title,
  sortKey,
  sort,
  onSort,
}: {
  label: string
  title?: string
  sortKey: UserSortKey
  sort: AdminSortState<UserSortKey>
  onSort: (next: AdminSortState<UserSortKey>) => void
}) {
  const isActive = sort.key === sortKey
  const Icon = !isActive ? ChevronsUpDown : sort.order === 'asc' ? ArrowUp : ArrowDown
  return (
    <button
      type="button"
      title={title ?? `Sort by ${label.toLowerCase()}`}
      onClick={() =>
        onSort({
          key: sortKey,
          order: isActive ? (sort.order === 'asc' ? 'desc' : 'asc') : 'desc',
        })
      }
      className={cn(
        'group -mx-1 inline-flex items-center gap-1 rounded-md px-1 py-0.5 uppercase tracking-[0.06em] transition-colors',
        'hover:text-dash-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        isActive && 'text-dash-ink'
      )}
    >
      {label}
      <Icon
        className={cn(
          'h-3 w-3 shrink-0 transition-opacity',
          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
        )}
        aria-hidden
      />
    </button>
  )
}

const rowIconButton = 'h-7 w-7 p-0 text-dash-muted hover:text-dash-ink'

function PlanMix({ byPlan, total }: { byPlan: AdminUserStats['by_plan']; total: number }) {
  const rows = [...byPlan].sort((a, b) => b.users - a.users)
  const sum = total > 0 ? total : rows.reduce((acc, r) => acc + r.users, 0)
  const max = Math.max(1, ...rows.map((r) => r.users))
  if (rows.length === 0) {
    return <DashboardEmpty icon={Layers} title="No plan data yet" />
  }
  return (
    <ul className="flex h-full flex-col justify-between gap-3.5">
      {rows.map((row) => {
        const share = sum > 0 ? (row.users / sum) * 100 : 0
        return (
          <li
            key={row.plan_name}
            className="grid grid-cols-[minmax(0,8.5rem)_minmax(0,1fr)_4.5rem_3.5rem] items-center gap-3"
          >
            <span className="truncate text-[13px] font-medium text-dash-ink" title={row.plan_name}>
              {row.plan_name || 'No plan'}
            </span>
            <span className="h-2.5 overflow-hidden rounded-full bg-dash-grid" aria-hidden>
              <span
                className="block h-full rounded-full bg-dash-teal"
                style={{ width: `${(row.users / max) * 100}%` }}
              />
            </span>
            <span className="text-right text-[13px] font-semibold tabular-nums text-dash-ink">
              {formatCount(row.users)}
            </span>
            <span className="text-right text-xs tabular-nums text-dash-muted">
              {share.toFixed(1)}%
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export default function UserManagement() {
  const router = useRouter()
  const { user: adminUser } = useAdmin()

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState<AdminUserStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [plans, setPlans] = useState<AdminPlan[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const [error, setError] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [actionError, setActionError] = useState('')
  const [feedbackTarget, setFeedbackTarget] = useState<AdminUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [sendingFeedback, setSendingFeedback] = useState(false)
  const [feedbackSuccess, setFeedbackSuccess] = useState('')
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null)
  const [banListVersion, setBanListVersion] = useState(0)
  const [status, setStatus] = useState<StatusFilter>('all')
  const [planId, setPlanId] = useState<'all' | number>('all')
  const [sort, setSort] = useState<AdminSortState<UserSortKey>>({
    key: 'created_at',
    order: 'desc',
  })

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true)
      setStats(await adminAPI.getUserStats())
    } catch {
      setStats(null)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await adminAPI.getUsers({
        skip: (page - 1) * pageSize,
        limit: pageSize,
        search: debouncedSearch || undefined,
        status: status === 'all' ? undefined : status,
        plan_id: planId === 'all' ? undefined : planId,
        sort_by: sort.key,
        sort_order: sort.order,
      })
      setUsers(response.users)
      setTotal(response.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setIsLoading(false)
      setHasLoadedOnce(true)
    }
  }, [page, pageSize, debouncedSearch, status, planId, sort.key, sort.order])

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    loadUsers()
  }, [loadUsers])

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    loadStats()
    adminAPI
      .getPlans()
      .then((res) => setPlans(res.plans))
      .catch(() => setPlans([]))
  }, [loadStats])

  const applyStatus = (next: StatusFilter) => {
    setStatus(next)
    setPage(1)
  }
  const applyPlan = (next: 'all' | number) => {
    setPlanId(next)
    setPage(1)
  }
  const applySort = (next: AdminSortState<UserSortKey>) => {
    setSort(next)
    setPage(1)
  }
  const applyPageSize = (next: number) => {
    setPageSize(next)
    setPage(1)
  }

  const refreshAll = useCallback(() => {
    loadUsers()
    loadStats()
  }, [loadUsers, loadStats])

  const pageSelectedCount = users.filter((u) => selectedUsers.includes(u.id)).length
  const allPageUsersSelected = users.length > 0 && pageSelectedCount === users.length

  const filtersActive =
    debouncedSearch !== '' || status !== 'all' || planId !== 'all'

  const handleUserAction = async (userId: number, action: 'activate' | 'deactivate') => {
    try {
      setActionError('')
      if (action === 'activate') await adminAPI.activateUser(userId)
      else await adminAPI.deactivateUser(userId)
      refreshAll()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : `Failed to ${action} user`)
    }
  }

  const handleBulkAction = async (action: 'activate' | 'deactivate') => {
    if (selectedUsers.length === 0) return
    try {
      setActionError('')
      await Promise.all(
        selectedUsers.map((id) =>
          action === 'activate' ? adminAPI.activateUser(id) : adminAPI.deactivateUser(id)
        )
      )
      setSelectedUsers([])
      refreshAll()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : `Failed to ${action} users`)
    }
  }

  const canDeleteUser = (account: AdminUser) =>
    !account.is_admin && adminUser?.id !== account.id

  const canResetUserPassword = (account: AdminUser) =>
    !account.is_admin && adminUser?.id !== account.id

  const handleResetUserPassword = async () => {
    if (!resetTarget) return
    try {
      setResetting(true)
      setActionError('')
      const result = await adminAPI.resetUserPassword(resetTarget.id)
      setFeedbackSuccess(`Temporary password emailed to ${result.email}.`)
      setResetTarget(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to reset password')
    } finally {
      setResetting(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      setActionError('')
      await adminAPI.deleteUser(deleteTarget.id)
      setFeedbackSuccess(`Deleted ${deleteTarget.email}. The action is in the audit log.`)
      setDeleteTarget(null)
      setSelectedUsers((ids) => ids.filter((id) => id !== deleteTarget.id))
      refreshAll()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete user')
    } finally {
      setDeleting(false)
    }
  }

  const handleSendFeedbackEmail = async () => {
    if (!feedbackTarget) return
    try {
      setSendingFeedback(true)
      setActionError('')
      const result = await adminAPI.sendUserFeedbackEmail(feedbackTarget.id)
      setFeedbackSuccess(
        result.reused_existing_send
          ? `Feedback email resent to ${feedbackTarget.email}.`
          : `Feedback email sent to ${feedbackTarget.email}. They can reply directly to the message.`
      )
      setFeedbackTarget(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to send feedback email')
    } finally {
      setSendingFeedback(false)
    }
  }

  const monthLabel = useMemo(
    () => new Date().toLocaleDateString('en', { month: 'long' }),
    []
  )

  const newThisMonthHint = useMemo(() => {
    if (!stats) return undefined
    const delta = stats.new_this_month - stats.new_last_month
    if (stats.new_last_month === 0) return `${monthLabel} to date`
    return `${delta >= 0 ? '+' : ''}${delta} vs last month`
  }, [stats, monthLabel])


  const newThisMonthDelta =
    stats && stats.new_last_month > 0 ? stats.new_this_month - stats.new_last_month : null

  if (!hasLoadedOnce && isLoading) {
    return (
      <AdminPage>
        <DashboardLoading message="Loading users…" />
      </AdminPage>
    )
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Users"
        description="Search accounts, review usage, revoke API keys, deactivate, delete, or ban an email domain."
        actions={<AdminRefreshButton onClick={refreshAll} loading={isLoading || statsLoading} />}
      />

      {error && users.length === 0 && <DashboardAlert variant="error">{error}</DashboardAlert>}
      {actionError && <DashboardAlert variant="error">{actionError}</DashboardAlert>}
      {feedbackSuccess && <DashboardAlert variant="success">{feedbackSuccess}</DashboardAlert>}

      {statsLoading && !stats ? (
        <AdminSkeletonStats />
      ) : (
        <AdminStatGrid>
          <DashboardStatCard
            label="Total users"
            value={stats ? formatCount(stats.total_users) : null}
            hint={
              stats
                ? `${formatCount(stats.verified_users)} verified · ${formatCount(stats.admin_users)} admin`
                : undefined
            }
            icon={Users}
            accent="brand"
          />
          <DashboardStatCard
            label="Active"
            value={stats ? formatCount(stats.active_users) : null}
            hint={stats ? `${formatCount(stats.inactive_users)} deactivated` : undefined}
            icon={CheckCircle}
            accent="green"
          />
          <DashboardStatCard
            label={`New in ${monthLabel}`}
            value={stats ? formatCount(stats.new_this_month) : null}
            delta={
              newThisMonthDelta != null ? (
                <DeltaPill value={newThisMonthDelta} unit="" label="vs last month" />
              ) : undefined
            }
            hint={newThisMonthDelta != null ? 'vs last month' : newThisMonthHint}
            icon={Mail}
            accent="indigo"
          />
          <DashboardStatCard
            label="Logged in (7d)"
            value={stats ? formatCount(stats.logged_in_7d) : null}
            hint={
              stats
                ? `${formatCount(stats.logged_in_30d)} in 30d · ${formatCount(stats.never_logged_in)} never`
                : undefined
            }
            icon={Calendar}
            accent="orange"
          />
        </AdminStatGrid>
      )}

      {stats && (
        <div className="dashboard-grid-wide">
          <AdminPanel className="flex flex-col">
            <AdminPanelHeader
              title="Users by plan"
              icon={Layers}
              description={`${formatCount(stats.total_users)} accounts`}
            />
            <AdminPanelBody className="flex-1">
              <PlanMix byPlan={stats.by_plan ?? []} total={stats.total_users} />
            </AdminPanelBody>
          </AdminPanel>
          <AdminPanel>
            <AdminPanelHeader title="Engagement" icon={Activity} description="Sign-ups and logins" />
            <AdminPanelBody>
              <DashboardStatList
                items={[
                  { label: 'New in last 7 days', value: formatCount(stats.new_last_7d) },
                  { label: 'New in last 30 days', value: formatCount(stats.new_last_30d) },
                  { label: 'Logged in (30d)', value: formatCount(stats.logged_in_30d) },
                  { label: 'Never logged in', value: formatCount(stats.never_logged_in) },
                  { label: 'Verified email', value: formatCount(stats.verified_users) },
                  { label: 'Admins', value: formatCount(stats.admin_users) },
                ]}
              />
            </AdminPanelBody>
          </AdminPanel>
        </div>
      )}

      <BannedEmailDomainsPanel
        refreshKey={banListVersion}
        onAccountsChanged={refreshAll}
      />

      <AdminPanel>
        <AdminPanelHeader
          title="All users"
          icon={Users}
          description={`${total.toLocaleString()} ${filtersActive ? 'matching' : 'total'}`}
          actions={
            selectedUsers.length > 0 ? (
              <>
                <span className="text-xs text-dash-muted tabular-nums">
                  {selectedUsers.length} selected
                </span>
                <Button variant="outline" size="sm" className="h-9" onClick={() => handleBulkAction('activate')}>
                  Activate
                </Button>
                <Button variant="outline" size="sm" className="h-9" onClick={() => handleBulkAction('deactivate')}>
                  Deactivate
                </Button>
                <Button variant="ghost" size="sm" className="h-9" onClick={() => setSelectedUsers([])}>
                  Clear
                </Button>
              </>
            ) : undefined
          }
        />
        <DashboardPanelToolbar>
          <DashboardSearchInput
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search users by name, email, or company..."
            ariaLabel="Search users"
            className="sm:min-w-[280px] sm:flex-1"
          />
          <select
            value={status}
            onChange={(e) => applyStatus(e.target.value as StatusFilter)}
            className="dashboard-select"
            aria-label="Filter by status"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="admin">Admins</option>
            <option value="unverified">Unverified email</option>
          </select>
          <select
            value={planId === 'all' ? 'all' : String(planId)}
            onChange={(e) =>
              applyPlan(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
            className="dashboard-select"
            aria-label="Filter by plan"
          >
            <option value="all">All plans</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>
          <select
            value={`${sort.key}-${sort.order}`}
            onChange={(e) => {
              const idx = e.target.value.lastIndexOf('-')
              applySort({
                key: e.target.value.slice(0, idx) as UserSortKey,
                order: e.target.value.slice(idx + 1) as SortOrder,
              })
            }}
            className="dashboard-select"
            aria-label="Sort users"
          >
            {SORT_PRESETS.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>
          {filtersActive && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => {
                setSearchInput('')
                applyStatus('all')
                applyPlan('all')
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={DASHBOARD_ICON_STROKE} />
              Clear
            </Button>
          )}
        </DashboardPanelToolbar>
        {users.length === 0 && !isLoading ? (
          <AdminPanelBody>
            <DashboardEmpty
              icon={Users}
              title="No users match your filters"
              description={filtersActive ? 'Try clearing the search or filters.' : undefined}
            />
          </AdminPanelBody>
        ) : (
          <AdminPanelBody noPadding className="!mt-0">
            <AdminTableWrap>
              <AdminTable className="[&_td]:px-2.5 [&_th]:px-2.5 min-[1400px]:[&_td]:px-3 min-[1400px]:[&_th]:px-3">
                <thead>
                  <tr>
                    <th className="w-10">
                      <input
                        type="checkbox"
                        aria-label="Select all users on this page"
                        checked={allPageUsersSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers((prev) =>
                              Array.from(new Set([...prev, ...users.map((u) => u.id)]))
                            )
                          } else {
                            setSelectedUsers((prev) =>
                              prev.filter((id) => !users.some((u) => u.id === id))
                            )
                          }
                        }}
                        className="h-4 w-4 rounded border-dash-border-strong accent-dash-teal-strong"
                      />
                    </th>
                    <AdminSortableTh
                      label="User"
                      sortKey="email"
                      sort={sort}
                      onSort={applySort}
                      defaultOrder="asc"
                    />
                    <AdminSortableTh label="Plan" sortKey="plan_price" sort={sort} onSort={applySort} />
                    <AdminSortableTh
                      label="Usage"
                      sortKey="total_requests"
                      sort={sort}
                      onSort={applySort}
                      title="Sort by total requests"
                      align="right"
                    />
                    <AdminSortableTh
                      label="Status"
                      sortKey="is_active"
                      sort={sort}
                      onSort={applySort}
                    />
                    <th
                      aria-sort={
                        sort.key === 'last_login' || sort.key === 'created_at'
                          ? sort.order === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                      }
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <SortToggle label="Login" title="Sort by last login" sortKey="last_login" sort={sort} onSort={applySort} />
                        <span className="text-dash-border-strong" aria-hidden>
                          /
                        </span>
                        <SortToggle label="Joined" sortKey="created_at" sort={sort} onSort={applySort} />
                      </span>
                    </th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={isLoading ? 'opacity-60 transition-opacity' : undefined}>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="dashboard-table-row-clickable"
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          aria-label={`Select ${user.email}`}
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedUsers((prev) => [...prev, user.id])
                            else setSelectedUsers((prev) => prev.filter((id) => id !== user.id))
                          }}
                          className="h-4 w-4 rounded border-dash-border-strong accent-dash-teal-strong"
                        />
                      </td>
                      <td>
                        <div className="flex min-w-0 max-w-[210px] items-center gap-3 min-[1400px]:max-w-[250px]">
                          <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dash-pill text-xs font-semibold text-dash-body min-[1400px]:flex">
                            {(user.first_name?.[0] || user.email[0] || '').toUpperCase()}
                            {(user.last_name?.[0] || '').toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex min-w-0 items-center gap-1.5">
                              <span className="truncate font-medium text-dash-ink">
                                {user.first_name || user.last_name
                                  ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                  : '—'}
                              </span>
                            </div>
                            <div className="truncate text-xs text-dash-muted" title={user.email}>
                              {user.email}
                              <span className="text-dash-dim"> · {user.company_name || 'no company'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <DashboardPill tone={planTone(user.plan_name || '')}>
                          {user.plan_name || 'No plan'}
                        </DashboardPill>
                        <div className="mt-1 whitespace-nowrap text-xs tabular-nums text-dash-muted">
                          ${Number(user.plan_price || 0)}/month
                        </div>
                      </td>
                      <td className="dashboard-num">
                        <div className="font-medium text-dash-ink">{formatCount(user.total_requests)}</div>
                        <div className="text-xs text-dash-muted min-[1400px]:whitespace-nowrap">
                          {formatCount(user.requests_this_month)} this month
                          <span className="hidden text-dash-dim min-[1400px]:inline"> · </span>
                          <span className="block text-dash-dim min-[1400px]:inline">
                            {user.api_keys_count || 0} API keys
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <DashboardPill tone={user.is_active ? 'green' : 'rose'}>
                            <span
                              className={cn(
                                'h-1.5 w-1.5 rounded-full',
                                user.is_active ? 'bg-dash-positive' : 'bg-dash-negative'
                              )}
                              aria-hidden
                            />
                            {user.is_active ? 'Active' : 'Inactive'}
                          </DashboardPill>
                          {user.is_admin && <DashboardPill tone="indigo">Admin</DashboardPill>}
                        </div>
                      </td>
                      <td className="whitespace-nowrap">
                        <div className="text-dash-ink">
                          {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                        </div>
                        <div className="text-xs text-dash-muted">
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end">
                          <Button asChild variant="ghost" size="sm" className={rowIconButton} title="View user details">
                            <Link href={`/admin/users/${user.id}`} aria-label="View user details">
                              <Eye className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={rowIconButton}
                            title="Send feedback request email"
                            aria-label="Send feedback request email"
                            onClick={() => {
                              setFeedbackSuccess('')
                              setFeedbackTarget(user)
                            }}
                          >
                            <Mail className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={rowIconButton}
                            title={`Ban @${emailDomainLabel(user.email)}`}
                            aria-label={`Ban the email domain for ${user.email}`}
                            onClick={() => {
                              setFeedbackSuccess('')
                              setBanTarget(user)
                            }}
                          >
                            <AtSign className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
                          </Button>
                          {canResetUserPassword(user) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={rowIconButton}
                              title="Reset password and email a temporary password"
                              aria-label="Reset password"
                              onClick={() => {
                                setFeedbackSuccess('')
                                setResetTarget(user)
                              }}
                            >
                              <KeyRound className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            title={user.is_active ? 'Deactivate account' : 'Activate account'}
                            aria-label={user.is_active ? 'Deactivate account' : 'Activate account'}
                            onClick={() =>
                              handleUserAction(user.id, user.is_active ? 'deactivate' : 'activate')
                            }
                            className={cn(
                              'h-7 w-7 p-0',
                              user.is_active
                                ? 'text-dash-negative hover:bg-dash-negative-soft hover:text-dash-negative'
                                : 'text-dash-positive hover:bg-dash-positive-soft hover:text-dash-positive'
                            )}
                          >
                            {user.is_active ? (
                              <Ban className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
                            ) : (
                              <CheckCircle className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
                            )}
                          </Button>
                          {canDeleteUser(user) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Delete account"
                              aria-label="Delete account"
                              onClick={() => {
                                setFeedbackSuccess('')
                                setDeleteTarget(user)
                              }}
                              className="h-7 w-7 p-0 text-dash-negative hover:bg-dash-negative-soft hover:text-dash-negative"
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </AdminTable>
            </AdminTableWrap>
            <AdminPagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
              onPageSizeChange={applyPageSize}
              loading={isLoading}
              noun="users"
            />
          </AdminPanelBody>
        )}
      </AdminPanel>

      <Dialog open={!!feedbackTarget} onOpenChange={(open) => !open && setFeedbackTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send feedback request</DialogTitle>
          </DialogHeader>
          {feedbackTarget && (
            <div className="space-y-3 text-[13px] leading-5 text-dash-muted">
              <p>
                Send a plain-text email to{' '}
                <span className="font-medium text-dash-ink">{feedbackTarget.email}</span> asking for
                feedback on the Food Nutrition API.
              </p>
              <p>
                The user replies directly to that email (no web form). Replies go to your Resend
                receiving address (<code className="rounded bg-dash-pill px-1 text-xs">*.resend.app</code>) and are forwarded
                to Discord when inbound webhooks are configured.
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setFeedbackTarget(null)}
              disabled={sendingFeedback}
            >
              Cancel
            </Button>
            <Button onClick={handleSendFeedbackEmail} disabled={sendingFeedback}>
              {sendingFeedback ? 'Sending…' : 'Send email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DeleteUserDialog
        open={!!deleteTarget}
        email={deleteTarget?.email || ''}
        busy={deleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDeleteUser}
      />
      <ResetUserPasswordDialog
        open={!!resetTarget}
        email={resetTarget?.email || ''}
        busy={resetting}
        onOpenChange={(open) => !open && setResetTarget(null)}
        onConfirm={handleResetUserPassword}
      />
      <BanEmailDomainDialog
        key={banTarget ? String(banTarget.id) : 'none'}
        open={!!banTarget}
        email={banTarget?.email || ''}
        onOpenChange={(open) => !open && setBanTarget(null)}
        onBanned={(message) => {
          setFeedbackSuccess(message)
          setBanTarget(null)
          setBanListVersion((version) => version + 1)
          refreshAll()
        }}
      />
    </AdminPage>
  )
}
