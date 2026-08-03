'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Search, Eye, Ban, CheckCircle, Mail, Calendar,
  Users, RotateCcw,
} from 'lucide-react'
import {
  adminAPI,
  AdminUser,
  AdminUserStats,
  AdminPlan,
  UserSortKey,
  SortOrder,
} from '@/lib/api/admin'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCount } from '@/lib/utils/format'
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

function planBadgeClass(planName: string) {
  switch (planName.toLowerCase()) {
    case 'free':
      return 'bg-gray-100 text-gray-800'
    case 'basic':
    case 'enterprise basic':
      return 'bg-blue-100 text-blue-800'
    case 'core':
    case 'enterprise core':
      return 'bg-green-100 text-green-800'
    case 'plus':
    case 'enterprise plus':
      return 'bg-purple-100 text-purple-800'
    case 'custom':
    case 'enterprise':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function UserManagement() {
  const router = useRouter()

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
  const [sendingFeedback, setSendingFeedback] = useState(false)
  const [feedbackSuccess, setFeedbackSuccess] = useState('')
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

  // Whole-table counts: computed server-side so they stay correct no matter how
  // many rows the current page holds.
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
    loadUsers()
  }, [loadUsers])

  useEffect(() => {
    loadStats()
    adminAPI
      .getPlans()
      .then((res) => setPlans(res.plans))
      .catch(() => setPlans([]))
  }, [loadStats])

  // Anything that changes the result set restarts paging at page 1. Done in the
  // setters rather than an effect so the list is fetched once, not twice (the
  // first fetch would otherwise use the previous page against the new filters).
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
        description="Search accounts, review usage, revoke API keys, and toggle access."
        actions={<AdminRefreshButton onClick={refreshAll} loading={isLoading || statsLoading} />}
      />

      {error && users.length === 0 && <DashboardAlert variant="error">{error}</DashboardAlert>}
      {actionError && <DashboardAlert variant="error">{actionError}</DashboardAlert>}
      {feedbackSuccess && <DashboardAlert variant="success">{feedbackSuccess}</DashboardAlert>}

      {statsLoading && !stats ? (
        <AdminSkeletonStats />
      ) : (
        <AdminStatGrid className="mb-6">
          <DashboardStatCard
            label="Total users"
            value={formatCount(stats?.total_users ?? 0)}
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
            value={formatCount(stats?.active_users ?? 0)}
            hint={stats ? `${formatCount(stats.inactive_users)} deactivated` : undefined}
            icon={CheckCircle}
            accent="green"
          />
          <DashboardStatCard
            label={`New in ${monthLabel}`}
            value={formatCount(stats?.new_this_month ?? 0)}
            hint={newThisMonthHint}
            icon={Mail}
            accent="purple"
          />
          <DashboardStatCard
            label="Logged in (7d)"
            value={formatCount(stats?.logged_in_7d ?? 0)}
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

      <AdminPanel className="mb-6">
        <AdminPanelHeader
          title="Search & filter"
          icon={Search}
          actions={
            filtersActive ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchInput('')
                  applyStatus('all')
                  applyPlan('all')
                }}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Clear
              </Button>
            ) : undefined
          }
        />
        <AdminPanelBody>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users by name, email, or company..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={status}
                onChange={(e) => applyStatus(e.target.value as StatusFilter)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                aria-label="Filter by status"
              >
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="admin">Admins</option>
                <option value="unverified">Unverified email</option>
              </select>
              {/* Plan options come from the plans table, so a new plan shows up here automatically. */}
              <select
                value={planId === 'all' ? 'all' : String(planId)}
                onChange={(e) =>
                  applyPlan(e.target.value === 'all' ? 'all' : Number(e.target.value))
                }
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
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
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                aria-label="Sort users"
              >
                {SORT_PRESETS.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </AdminPanelBody>
      </AdminPanel>

      <AdminPanel>
        <AdminPanelHeader
          title={`Users (${total.toLocaleString()})`}
          icon={Users}
          actions={
            selectedUsers.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-muted">{selectedUsers.length} selected</span>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('activate')}>
                  Activate
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('deactivate')}>
                  Deactivate
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedUsers([])}>
                  Clear
                </Button>
              </div>
            ) : undefined
          }
        />
        {users.length === 0 && !isLoading ? (
          <DashboardEmpty
            icon={Users}
            title="No users match your filters"
            description={filtersActive ? 'Try clearing the search or filters.' : undefined}
          />
        ) : (
          <AdminPanelBody noPadding>
            <AdminTableWrap>
              <AdminTable>
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
                        className="rounded border-gray-300"
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
                    />
                    <AdminSortableTh
                      label="Status"
                      sortKey="is_active"
                      sort={sort}
                      onSort={applySort}
                    />
                    <AdminSortableTh
                      label="Last login"
                      sortKey="last_login"
                      sort={sort}
                      onSort={applySort}
                    />
                    <AdminSortableTh
                      label="Joined"
                      sortKey="created_at"
                      sort={sort}
                      onSort={applySort}
                    />
                    <th>Actions</th>
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
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-sm font-medium text-gray-700">
                              {(user.first_name?.[0] || user.email[0] || '').toUpperCase()}
                              {(user.last_name?.[0] || '').toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {user.first_name || user.last_name
                                ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                : '—'}
                            </div>
                            <div className="text-sm text-gray-500 truncate">{user.email}</div>
                            <div className="text-xs text-gray-400 truncate">
                              {user.company_name || 'no company'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge className={planBadgeClass(user.plan_name || '')}>
                          {user.plan_name || 'No plan'}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          ${Number(user.plan_price || 0)}/month
                        </div>
                      </td>
                      <td className="tabular-nums">
                        <div className="font-medium">{formatCount(user.total_requests)}</div>
                        <div className="text-xs text-gray-500">
                          {formatCount(user.requests_this_month)} this month
                        </div>
                        <div className="text-xs text-gray-400">
                          {user.api_keys_count || 0} API keys
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge
                            className={
                              user.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }
                          >
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {user.is_admin && (
                            <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
                          )}
                        </div>
                      </td>
                      <td className="text-sm text-gray-500 whitespace-nowrap">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="text-sm text-gray-500 whitespace-nowrap">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <Link href={`/admin/users/${user.id}`}>
                            <Button variant="ghost" size="sm" title="View user details">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Send feedback request email"
                            onClick={() => {
                              setFeedbackSuccess('')
                              setFeedbackTarget(user)
                            }}
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title={user.is_active ? 'Deactivate account' : 'Activate account'}
                            onClick={() =>
                              handleUserAction(user.id, user.is_active ? 'deactivate' : 'activate')
                            }
                            className={
                              user.is_active
                                ? 'text-red-600 hover:text-red-700'
                                : 'text-green-600 hover:text-green-700'
                            }
                          >
                            {user.is_active ? (
                              <Ban className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </Button>
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
            <div className="space-y-3 text-sm text-ink-muted">
              <p>
                Send a plain-text email to{' '}
                <span className="font-medium text-ink">{feedbackTarget.email}</span> asking for
                feedback on the Food Nutrition API.
              </p>
              <p>
                The user replies directly to that email (no web form). Replies go to your Resend
                receiving address (<code className="text-xs">*.resend.app</code>) and are forwarded
                to Discord when inbound webhooks are configured.
              </p>
            </div>
          )}
          <DialogFooter>
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
    </AdminPage>
  )
}
