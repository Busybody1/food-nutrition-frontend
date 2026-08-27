'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Activity,
  ArrowLeft,
  Ban,
  CheckCircle,
  Gauge,
  KeyRound,
  List,
  Mail,
  RotateCcw,
  Search,
  Shield,
  Trash2,
  TrendingUp,
  User as UserIcon,
  LifeBuoy,
} from 'lucide-react'
import {
  adminAPI,
  AdminUserDetail,
  AdminApiKeyRow,
  ApiRequestRow,
  UserUsagePayload,
  UserRequestSummary,
  RequestSortKey,
} from '@/lib/api/admin'
import { DeleteUserDialog } from '@/components/admin/delete-user-dialog'
import { useAdmin } from '@/lib/hooks/use-admin'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AdminLineChart } from '@/components/admin/admin-charts'
import { formatCount, formatMs } from '@/lib/utils/format'
import {
  AdminPage,
  AdminPageHeader,
  AdminStatGrid,
  DashboardStatCard,
  AdminPanel,
  AdminPanelHeader,
  AdminPanelBody,
  AdminFilterBar,
  AdminFilterField,
  AdminTableWrap,
  AdminTable,
  AdminSortableTh,
  AdminPagination,
  AdminSortState,
  AdminHttpStatusBadge,
  AdminDetailGrid,
  AdminTimeRangeToggle,
  AdminRefreshButton,
  DashboardLoading,
  DashboardAlert,
  DashboardEmpty,
} from '@/components/admin/admin-ui'

type UsageRange = '7d' | '30d' | '90d' | '1y' | 'all'

const REQUESTS_PAGE_SIZE = 25

const EMPTY_FILTERS = {
  endpoint: '',
  method: '',
  status_min: '',
  status_max: '',
  date_from: '',
  date_to: '',
}

function fullName(user: AdminUserDetail): string {
  const name = `${user.first_name || ''} ${user.last_name || ''}`.trim()
  return name || user.email
}

function formatDateTime(value?: string | null): string {
  return value ? new Date(value).toLocaleString() : '—'
}

/** "3 months" style age of the account, for the header subtitle. */
function relativeAge(iso?: string | null): string {
  if (!iso) return '—'
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days < 1) return 'today'
  if (days === 1) return '1 day ago'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`
  const years = Math.floor(days / 365)
  return `${years} year${years === 1 ? '' : 's'} ago`
}

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user: adminUser } = useAdmin()
  const userId = Number(params?.id)

  const [user, setUser] = useState<AdminUserDetail | null>(null)
  const [usage, setUsage] = useState<UserUsagePayload | null>(null)
  const [summary, setSummary] = useState<UserRequestSummary | null>(null)
  const [apiKeys, setApiKeys] = useState<AdminApiKeyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [usageRange, setUsageRange] = useState<UsageRange>('30d')
  const [busy, setBusy] = useState(false)
  const [confirmFeedback, setConfirmFeedback] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [revokingKeyId, setRevokingKeyId] = useState<number | null>(null)
  const [supportThreadId, setSupportThreadId] = useState<number | null>(null)

  // Request history (server-paginated, filtered and sorted).
  const [requests, setRequests] = useState<ApiRequestRow[]>([])
  const [requestsTotal, setRequestsTotal] = useState(0)
  const [requestsLoading, setRequestsLoading] = useState(true)
  const [requestsError, setRequestsError] = useState('')
  const [requestsPage, setRequestsPage] = useState(1)
  const [requestsPageSize, setRequestsPageSize] = useState(REQUESTS_PAGE_SIZE)
  const [requestSort, setRequestSort] = useState<AdminSortState<RequestSortKey>>({
    key: 'created_at',
    order: 'desc',
  })
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS)
  const [selectedRequest, setSelectedRequest] = useState<ApiRequestRow | null>(null)

  const loadUser = useCallback(async () => {
    if (!Number.isFinite(userId)) {
      setError('Invalid user id')
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError('')
      const [detail, keys, requestSummary] = await Promise.all([
        adminAPI.getUser(userId),
        adminAPI.getUserApiKeys(userId).catch(() => ({ api_keys: [] as AdminApiKeyRow[] })),
        adminAPI.getUserRequestSummary(userId).catch(() => null),
      ])
      setUser(detail)
      setApiKeys(keys.api_keys)
      setSummary(requestSummary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user')
    } finally {
      setLoading(false)
    }
  }, [userId])

  const loadUsage = useCallback(async () => {
    if (!Number.isFinite(userId)) return
    try {
      setUsage(await adminAPI.getUserUsage(userId, usageRange))
    } catch {
      setUsage(null)
    }
  }, [userId, usageRange])

  const loadRequests = useCallback(async () => {
    if (!Number.isFinite(userId)) return
    try {
      setRequestsLoading(true)
      setRequestsError('')
      const res = await adminAPI.getUserRequests(userId, {
        skip: (requestsPage - 1) * requestsPageSize,
        limit: requestsPageSize,
        sort_by: requestSort.key,
        sort_order: requestSort.order,
        endpoint: appliedFilters.endpoint || undefined,
        method: appliedFilters.method || undefined,
        status_min: appliedFilters.status_min ? Number(appliedFilters.status_min) : undefined,
        status_max: appliedFilters.status_max ? Number(appliedFilters.status_max) : undefined,
        date_from: appliedFilters.date_from || undefined,
        date_to: appliedFilters.date_to || undefined,
      })
      setRequests(res.requests)
      setRequestsTotal(res.total)
    } catch (err) {
      setRequestsError(err instanceof Error ? err.message : 'Failed to load request history')
    } finally {
      setRequestsLoading(false)
    }
  }, [userId, requestsPage, requestsPageSize, requestSort, appliedFilters])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  useEffect(() => {
    loadUsage()
  }, [loadUsage])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  useEffect(() => {
    if (!Number.isFinite(userId) || userId <= 0) return
    adminAPI
      .getSupportConversations({ user_id: userId, limit: 1 })
      .then((data) => setSupportThreadId(data.conversations[0]?.id ?? null))
      .catch(() => setSupportThreadId(null))
  }, [userId])

  // Reset paging in the setters, not an effect, so each change fetches once.
  const applyRequestFilters = (next: typeof EMPTY_FILTERS) => {
    setAppliedFilters(next)
    setRequestsPage(1)
  }
  const applyRequestSort = (next: AdminSortState<RequestSortKey>) => {
    setRequestSort(next)
    setRequestsPage(1)
  }
  const applyRequestsPageSize = (next: number) => {
    setRequestsPageSize(next)
    setRequestsPage(1)
  }

  const refreshAll = useCallback(() => {
    loadUser()
    loadUsage()
    loadRequests()
  }, [loadUser, loadUsage, loadRequests])

  const deleteAccount = async () => {
    if (!user) return
    try {
      setBusy(true)
      setActionError('')
      setActionSuccess('')
      await adminAPI.deleteUser(user.id)
      router.push('/admin/users')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete user')
      setBusy(false)
    }
  }

  const toggleActive = async () => {
    if (!user) return
    try {
      setBusy(true)
      setActionError('')
      setActionSuccess('')
      if (user.is_active) await adminAPI.deactivateUser(user.id)
      else await adminAPI.activateUser(user.id)
      setActionSuccess(user.is_active ? 'Account deactivated.' : 'Account activated.')
      await loadUser()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update account')
    } finally {
      setBusy(false)
    }
  }

  const sendFeedbackEmail = async () => {
    if (!user) return
    try {
      setBusy(true)
      setActionError('')
      const result = await adminAPI.sendUserFeedbackEmail(user.id)
      setActionSuccess(
        result.reused_existing_send
          ? `Feedback email resent to ${user.email}.`
          : `Feedback email sent to ${user.email}.`
      )
      setConfirmFeedback(false)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to send feedback email')
    } finally {
      setBusy(false)
    }
  }

  const revokeKey = async (keyId: number) => {
    if (!user) return
    try {
      setRevokingKeyId(keyId)
      setActionError('')
      await adminAPI.revokeUserApiKey(user.id, keyId)
      const keys = await adminAPI.getUserApiKeys(user.id)
      setApiKeys(keys.api_keys)
      setActionSuccess('API key revoked.')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to revoke API key')
    } finally {
      setRevokingKeyId(null)
    }
  }

  const usageChartData = useMemo(
    () =>
      (usage?.daily ?? []).map((d) => ({
        date: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        requests: d.requests,
      })),
    [usage]
  )

  const errorRate = useMemo(() => {
    if (!user?.total_requests) return 0
    return ((user.error_requests ?? 0) / user.total_requests) * 100
  }, [user])

  const filtersDirty = useMemo(
    () => JSON.stringify(draftFilters) !== JSON.stringify(appliedFilters),
    [draftFilters, appliedFilters]
  )
  const filtersActive = useMemo(
    () => Object.values(appliedFilters).some(Boolean),
    [appliedFilters]
  )

  if (loading && !user) {
    return (
      <AdminPage>
        <DashboardLoading message="Loading user…" />
      </AdminPage>
    )
  }

  if (error && !user) {
    return (
      <AdminPage>
        <DashboardAlert variant="error">
          {error}
          <Button variant="outline" size="sm" className="ml-3" onClick={loadUser}>
            Retry
          </Button>
        </DashboardAlert>
        <Button variant="outline" onClick={() => router.push('/admin/users')}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to users
        </Button>
      </AdminPage>
    )
  }

  if (!user) return null

  return (
    <AdminPage>
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-brand-strong transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to users
        </Link>
      </div>

      <AdminPageHeader
        title={fullName(user)}
        description={`${user.email} · joined ${relativeAge(user.created_at)}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={
                user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }
            >
              {user.is_active ? 'Active' : 'Inactive'}
            </Badge>
            {user.is_admin && <Badge className="bg-purple-100 text-purple-800">Admin</Badge>}
            {user.email_verified ? (
              <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-900">Unverified</Badge>
            )}
            <AdminRefreshButton onClick={refreshAll} loading={loading} />
          </div>
        }
      />

      {actionError && <DashboardAlert variant="error">{actionError}</DashboardAlert>}
      {actionSuccess && <DashboardAlert variant="success">{actionSuccess}</DashboardAlert>}

      <AdminStatGrid>
        <DashboardStatCard
          label="Total requests"
          value={formatCount(user.total_requests)}
          hint={`Since ${new Date(user.created_at).toLocaleDateString()}`}
          icon={Activity}
          accent="brand"
        />
        <DashboardStatCard
          label="This month"
          value={formatCount(user.requests_this_month)}
          hint={`${formatCount(user.requests_last_7d)} in last 7 days`}
          icon={TrendingUp}
          accent="green"
        />
        <DashboardStatCard
          label="Avg response"
          value={
            user.avg_response_time_ms != null ? `${formatMs(user.avg_response_time_ms)}ms` : '—'
          }
          hint={`Error rate ${errorRate.toFixed(2)}%`}
          icon={Gauge}
          accent="purple"
        />
        <DashboardStatCard
          label="API keys"
          value={formatCount(user.api_keys_count)}
          hint={`${formatCount(user.api_keys_total)} created all-time`}
          icon={KeyRound}
          accent="orange"
        />
      </AdminStatGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AdminPanel className="lg:col-span-2">
          <AdminPanelHeader
            title="Usage over time"
            icon={TrendingUp}
            actions={
              <AdminTimeRangeToggle
                value={usageRange}
                options={[
                  { value: '7d' as const, label: '7d' },
                  { value: '30d' as const, label: '30d' },
                  { value: '90d' as const, label: '90d' },
                  { value: '1y' as const, label: '1y' },
                  { value: 'all' as const, label: 'All' },
                ]}
                onChange={setUsageRange}
              />
            }
          />
          <AdminPanelBody>
            {usageChartData.length > 0 ? (
              <AdminLineChart data={usageChartData} xKey="date" yKey="requests" height={240} />
            ) : (
              <DashboardEmpty
                icon={Activity}
                title="No requests in this period"
                description="Pick a wider range or check back after the account makes API calls."
              />
            )}
          </AdminPanelBody>
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader title="Account" icon={UserIcon} />
          <AdminPanelBody>
            <AdminDetailGrid
              items={[
                { label: 'User ID', value: `#${user.id}`, mono: true },
                { label: 'Email', value: user.email, mono: true },
                { label: 'Company', value: user.company_name || '—' },
                { label: 'Plan', value: user.plan_name || 'No plan' },
                {
                  label: 'Monthly quota',
                  value:
                    user.plan_monthly_quota != null
                      ? formatCount(user.plan_monthly_quota)
                      : '—',
                },
                {
                  label: 'Rate limit',
                  value:
                    user.plan_rate_limit_per_minute != null
                      ? `${formatCount(user.plan_rate_limit_per_minute)}/min`
                      : '—',
                },
                { label: 'Joined', value: formatDateTime(user.created_at) },
                { label: 'Last login', value: formatDateTime(user.last_login) },
                { label: 'First request', value: formatDateTime(user.first_request_at) },
                { label: 'Last request', value: formatDateTime(user.last_request_at) },
                { label: 'Active days', value: formatCount(user.active_days) },
                { label: 'Endpoints used', value: formatCount(user.distinct_endpoints) },
              ]}
            />
          </AdminPanelBody>
          <div className="flex flex-wrap gap-2 px-5 pb-5">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleActive}
              disabled={busy}
              className={
                user.is_active
                  ? 'text-red-600 hover:text-red-700'
                  : 'text-green-600 hover:text-green-700'
              }
            >
              {user.is_active ? (
                <>
                  <Ban className="h-4 w-4 mr-1.5" />
                  Deactivate
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  Activate
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmFeedback(true)}
              disabled={busy}
            >
              <Mail className="h-4 w-4 mr-1.5" />
              Request feedback
            </Button>
            {supportThreadId ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/support/${supportThreadId}`}>
                  <LifeBuoy className="h-4 w-4 mr-1.5" />
                  Open support chat
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled title="This user has not started a support chat">
                <LifeBuoy className="h-4 w-4 mr-1.5" />
                No support thread
              </Button>
            )}
            {user && !user.is_admin && adminUser?.id !== user.id && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                disabled={busy}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete
              </Button>
            )}
            <Link href={`/admin/requests?user_id=${user.id}`}>
              <Button variant="outline" size="sm">
                <List className="h-4 w-4 mr-1.5" />
                Global log
              </Button>
            </Link>
          </div>
        </AdminPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminPanel>
          <AdminPanelHeader title="Top endpoints (all time)" icon={Activity} />
          {!summary || summary.by_endpoint.length === 0 ? (
            <DashboardEmpty icon={Activity} title="No endpoint activity yet" />
          ) : (
            <AdminPanelBody noPadding>
              <AdminTableWrap>
                <AdminTable>
                  <thead>
                    <tr>
                      <th>Endpoint</th>
                      <th>Requests</th>
                      <th>Errors</th>
                      <th>Avg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.by_endpoint.slice(0, 10).map((row) => (
                      <tr key={row.endpoint}>
                        <td className="font-mono text-xs max-w-[220px] truncate" title={row.endpoint}>
                          {row.endpoint}
                        </td>
                        <td className="tabular-nums">{formatCount(row.requests)}</td>
                        <td className="tabular-nums">
                          {row.errors > 0 ? (
                            <span className="text-amber-800">{formatCount(row.errors)}</span>
                          ) : (
                            '0'
                          )}
                        </td>
                        <td className="tabular-nums text-ink-muted">
                          {row.avg_response_time != null ? `${formatMs(row.avg_response_time)}ms` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </AdminTable>
              </AdminTableWrap>
            </AdminPanelBody>
          )}
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader title="API keys" icon={KeyRound} />
          {apiKeys.length === 0 ? (
            <DashboardEmpty icon={KeyRound} title="No API keys" />
          ) : (
            <AdminPanelBody noPadding>
              <AdminTableWrap>
                <AdminTable>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Created</th>
                      <th>Last used</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map((key) => (
                      <tr key={key.id}>
                        <td className="max-w-[160px] truncate">{key.name || `Key #${key.id}`}</td>
                        <td className="text-xs text-ink-muted whitespace-nowrap">
                          {key.created_at ? new Date(key.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="text-xs text-ink-muted whitespace-nowrap">
                          {key.last_used_at
                            ? new Date(key.last_used_at).toLocaleDateString()
                            : 'Never'}
                        </td>
                        <td>
                          {key.is_active ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={revokingKeyId === key.id}
                              onClick={() => revokeKey(key.id)}
                            >
                              {revokingKeyId === key.id ? 'Revoking…' : 'Revoke'}
                            </Button>
                          ) : (
                            <Badge variant="outline">Revoked</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </AdminTable>
              </AdminTableWrap>
            </AdminPanelBody>
          )}
        </AdminPanel>
      </div>

      {summary && summary.status_mix.length > 0 && (
        <AdminPanel>
          <AdminPanelHeader title="Status codes (all time)" icon={Shield} />
          <AdminPanelBody>
            <div className="flex flex-wrap gap-2">
              {summary.status_mix.map((row) => (
                <div
                  key={row.status_code}
                  className="flex items-center gap-2 rounded-brand border border-surface-border/60 px-3 py-2"
                >
                  <AdminHttpStatusBadge code={row.status_code} />
                  <span className="text-sm tabular-nums text-ink">{formatCount(row.count)}</span>
                </div>
              ))}
            </div>
          </AdminPanelBody>
        </AdminPanel>
      )}

      <AdminPanel>
        <AdminPanelHeader
          title="Request history"
          icon={List}
          actions={
            <span className="text-xs text-ink-muted tabular-nums">
              {formatCount(requestsTotal)} {filtersActive ? 'matching' : 'total'} since signup
            </span>
          }
        />
        <AdminPanelBody>
          <AdminFilterBar>
            <AdminFilterField label="Endpoint">
              <Input
                placeholder="Contains path…"
                value={draftFilters.endpoint}
                onChange={(e) => setDraftFilters((f) => ({ ...f, endpoint: e.target.value }))}
              />
            </AdminFilterField>
            <AdminFilterField label="HTTP method">
              <Input
                placeholder="GET"
                value={draftFilters.method}
                onChange={(e) => setDraftFilters((f) => ({ ...f, method: e.target.value }))}
              />
            </AdminFilterField>
            <AdminFilterField label="Min status">
              <Input
                placeholder="400"
                inputMode="numeric"
                value={draftFilters.status_min}
                onChange={(e) => setDraftFilters((f) => ({ ...f, status_min: e.target.value }))}
              />
            </AdminFilterField>
            <AdminFilterField label="Max status">
              <Input
                placeholder="599"
                inputMode="numeric"
                value={draftFilters.status_max}
                onChange={(e) => setDraftFilters((f) => ({ ...f, status_max: e.target.value }))}
              />
            </AdminFilterField>
            <AdminFilterField label="From">
              <Input
                type="datetime-local"
                value={draftFilters.date_from}
                onChange={(e) => setDraftFilters((f) => ({ ...f, date_from: e.target.value }))}
              />
            </AdminFilterField>
            <AdminFilterField label="To">
              <Input
                type="datetime-local"
                value={draftFilters.date_to}
                onChange={(e) => setDraftFilters((f) => ({ ...f, date_to: e.target.value }))}
              />
            </AdminFilterField>
          </AdminFilterBar>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button onClick={() => applyRequestFilters(draftFilters)} disabled={!filtersDirty}>
              <Search className="h-4 w-4 mr-1.5" />
              Apply filters
            </Button>
            <Button
              variant="outline"
              disabled={!filtersActive && !filtersDirty}
              onClick={() => {
                setDraftFilters(EMPTY_FILTERS)
                applyRequestFilters(EMPTY_FILTERS)
              }}
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Clear
            </Button>
          </div>
        </AdminPanelBody>

        {requestsError && (
          <div className="px-5 pb-4">
            <DashboardAlert variant="error">
              {requestsError}
              <Button variant="outline" size="sm" className="ml-3" onClick={loadRequests}>
                Retry
              </Button>
            </DashboardAlert>
          </div>
        )}

        {requestsLoading && requests.length === 0 ? (
          <DashboardLoading message="Loading request history…" />
        ) : requests.length === 0 ? (
          <DashboardEmpty
            icon={List}
            title="No requests found"
            description={
              filtersActive
                ? 'No calls match these filters. Try widening the range.'
                : 'This account has not called the API yet.'
            }
          />
        ) : (
          <>
            <AdminTableWrap>
              <AdminTable>
                <thead>
                  <tr>
                    <AdminSortableTh
                      label="Time"
                      sortKey="created_at"
                      sort={requestSort}
                      onSort={applyRequestSort}
                    />
                    <AdminSortableTh
                      label="Method"
                      sortKey="method"
                      sort={requestSort}
                      onSort={applyRequestSort}
                      defaultOrder="asc"
                    />
                    <AdminSortableTh
                      label="Endpoint"
                      sortKey="endpoint"
                      sort={requestSort}
                      onSort={applyRequestSort}
                      defaultOrder="asc"
                    />
                    <AdminSortableTh
                      label="Status"
                      sortKey="status_code"
                      sort={requestSort}
                      onSort={applyRequestSort}
                    />
                    <AdminSortableTh
                      label="Latency"
                      sortKey="response_time_ms"
                      sort={requestSort}
                      onSort={applyRequestSort}
                    />
                    <th>Key</th>
                  </tr>
                </thead>
                <tbody className={requestsLoading ? 'opacity-60 transition-opacity' : undefined}>
                  {requests.map((row) => (
                    <tr
                      key={row.id}
                      className="dashboard-table-row-clickable"
                      onClick={() => setSelectedRequest(row)}
                    >
                      <td className="whitespace-nowrap text-ink-muted text-xs">
                        {new Date(row.created_at).toLocaleString()}
                      </td>
                      <td className="font-mono text-xs text-ink-dim">{row.method}</td>
                      <td
                        className="font-mono text-xs max-w-[280px] truncate"
                        title={row.endpoint}
                      >
                        {row.endpoint}
                      </td>
                      <td>
                        <AdminHttpStatusBadge code={row.status_code} />
                      </td>
                      <td className="tabular-nums">{formatMs(row.response_time_ms)}ms</td>
                      <td className="text-xs text-ink-muted">{row.api_key_id ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </AdminTable>
            </AdminTableWrap>
            <AdminPagination
              page={requestsPage}
              pageSize={requestsPageSize}
              total={requestsTotal}
              onPageChange={setRequestsPage}
              onPageSizeChange={applyRequestsPageSize}
              pageSizeOptions={[25, 50, 100, 200]}
              loading={requestsLoading}
              noun="requests"
            />
          </>
        )}
      </AdminPanel>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request #{selectedRequest?.id}</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <AdminDetailGrid
              items={[
                {
                  label: 'Endpoint',
                  value: `${selectedRequest.method} ${selectedRequest.endpoint}`,
                  mono: true,
                },
                {
                  label: 'Status',
                  value: <AdminHttpStatusBadge code={selectedRequest.status_code} />,
                },
                {
                  label: 'Response time',
                  value: `${formatMs(selectedRequest.response_time_ms)}ms`,
                },
                { label: 'API key', value: String(selectedRequest.api_key_id ?? '—') },
                { label: 'IP address', value: selectedRequest.ip_address || '—', mono: true },
                {
                  label: 'Timestamp',
                  value: new Date(selectedRequest.created_at).toLocaleString(),
                },
              ]}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirmFeedback} onOpenChange={(open) => !open && setConfirmFeedback(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send feedback request</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-ink-muted">
            Send a plain-text email to <span className="font-medium text-ink">{user.email}</span>{' '}
            asking for feedback on the Food Nutrition API. They reply directly to that email.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmFeedback(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={sendFeedbackEmail} disabled={busy}>
              {busy ? 'Sending…' : 'Send email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DeleteUserDialog
        open={confirmDelete}
        email={user.email}
        busy={busy}
        onOpenChange={setConfirmDelete}
        onConfirm={deleteAccount}
      />
    </AdminPage>
  )
}
