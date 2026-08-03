'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { adminAPI, ApiRequestRow } from '@/lib/api/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { List, Search, RotateCcw, AlertTriangle, Gauge } from 'lucide-react'
import { formatCount, formatMs, toNumber } from '@/lib/utils/format'
import {
  AdminPage,
  AdminPageHeader,
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
  AdminRefreshButton,
  DashboardLoading,
  DashboardAlert,
  DashboardEmpty,
  DashboardStatCard,
} from '@/components/admin/admin-ui'

type RequestSortKey =
  | 'created_at'
  | 'response_time_ms'
  | 'status_code'
  | 'endpoint'
  | 'method'
  | 'email'

const EMPTY_FILTERS = {
  user_id: '',
  endpoint: '',
  method: '',
  status_min: '',
  date_from: '',
  date_to: '',
}

function AdminRequestsContent() {
  const searchParams = useSearchParams()
  const userIdParam = searchParams?.get('user_id') ?? ''

  const [requests, setRequests] = useState<ApiRequestRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<ApiRequestRow | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [sort, setSort] = useState<AdminSortState<RequestSortKey>>({
    key: 'created_at',
    order: 'desc',
  })
  const [draftFilters, setDraftFilters] = useState({ ...EMPTY_FILTERS, user_id: userIdParam })
  const [appliedFilters, setAppliedFilters] = useState({
    ...EMPTY_FILTERS,
    user_id: userIdParam,
  })

  // Deep link from a user detail page (?user_id=42) pre-fills and applies the filter.
  useEffect(() => {
    if (!userIdParam) return
    setDraftFilters((f) => ({ ...f, user_id: userIdParam }))
    setAppliedFilters((f) => ({ ...f, user_id: userIdParam }))
  }, [userIdParam])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, unknown> = {
        limit: pageSize,
        skip: (page - 1) * pageSize,
        sort_by: sort.key,
        sort_order: sort.order,
        with_total: true,
      }
      if (appliedFilters.user_id) params.user_id = Number(appliedFilters.user_id)
      if (appliedFilters.endpoint) params.endpoint = appliedFilters.endpoint
      if (appliedFilters.method) params.method = appliedFilters.method
      if (appliedFilters.status_min) params.status_min = Number(appliedFilters.status_min)
      if (appliedFilters.date_from) params.date_from = appliedFilters.date_from
      if (appliedFilters.date_to) params.date_to = appliedFilters.date_to

      const data = await adminAPI.getApiRequests(params)
      setRequests(data.requests)
      setTotal(data.total ?? data.requests.length)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, sort, appliedFilters])

  useEffect(() => {
    load()
  }, [load])

  // Reset paging in the setters, not an effect, so a filter/sort change fetches
  // once instead of firing a stale-page request first.
  const applyFilters = (next: typeof EMPTY_FILTERS) => {
    setAppliedFilters(next)
    setPage(1)
  }
  const applySort = (next: AdminSortState<RequestSortKey>) => {
    setSort(next)
    setPage(1)
  }
  const applyPageSize = (next: number) => {
    setPageSize(next)
    setPage(1)
  }

  const errorCount = requests.filter((r) => r.status_code >= 400).length
  const avgLatency =
    requests.length > 0
      ? requests.reduce((sum, r) => sum + toNumber(r.response_time_ms), 0) / requests.length
      : 0
  const filtersActive = Object.values(appliedFilters).some(Boolean)
  const filtersDirty = JSON.stringify(draftFilters) !== JSON.stringify(appliedFilters)

  return (
    <AdminPage>
      <AdminPageHeader
        title="API request log"
        description="Search and inspect every authenticated API call recorded in api_usage."
        actions={<AdminRefreshButton onClick={load} loading={loading} />}
      />

      {error && (
        <DashboardAlert variant="error">
          {error}
          <Button variant="outline" size="sm" className="ml-3" onClick={load}>
            Retry
          </Button>
        </DashboardAlert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardStatCard
          label={filtersActive ? 'Matching requests' : 'Total requests'}
          value={formatCount(total)}
          hint={`Page ${page} · ${requests.length} shown`}
          icon={List}
          accent="brand"
        />
        <DashboardStatCard
          label="Errors on this page"
          value={formatCount(errorCount)}
          hint={
            requests.length > 0
              ? `${((errorCount / requests.length) * 100).toFixed(1)}% of shown`
              : undefined
          }
          icon={AlertTriangle}
          accent="orange"
        />
        <DashboardStatCard
          label="Avg latency (page)"
          value={requests.length > 0 ? `${formatMs(avgLatency)}ms` : '—'}
          hint="Click a row for full request details"
          icon={Gauge}
          accent="purple"
        />
      </div>

      <AdminPanel>
        <AdminPanelHeader title="Filters" icon={Search} />
        <AdminPanelBody>
          <AdminFilterBar>
            <AdminFilterField label="User ID">
              <Input
                placeholder="e.g. 42"
                value={draftFilters.user_id}
                onChange={(e) => setDraftFilters((f) => ({ ...f, user_id: e.target.value }))}
              />
            </AdminFilterField>
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
            <Button onClick={() => applyFilters(draftFilters)} disabled={!filtersDirty}>
              <Search className="h-4 w-4 mr-1.5" />
              Apply filters
            </Button>
            <Button
              variant="outline"
              disabled={!filtersActive && !filtersDirty}
              onClick={() => {
                setDraftFilters(EMPTY_FILTERS)
                applyFilters(EMPTY_FILTERS)
              }}
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Clear
            </Button>
          </div>
        </AdminPanelBody>
      </AdminPanel>

      <AdminPanel>
        <AdminPanelHeader title="Requests" icon={List} />
        {loading && requests.length === 0 ? (
          <DashboardLoading message="Loading request log…" />
        ) : !loading && requests.length === 0 ? (
          <DashboardEmpty
            icon={List}
            title="No requests match your filters"
            description="Try widening the date range or clearing filters."
            action={
              <Button variant="outline" onClick={load}>
                Refresh
              </Button>
            }
          />
        ) : (
          <>
            <AdminPanelBody noPadding>
              <AdminTableWrap>
                <AdminTable>
                  <thead>
                    <tr>
                      <AdminSortableTh
                        label="Time"
                        sortKey="created_at"
                        sort={sort}
                        onSort={applySort}
                      />
                      <AdminSortableTh
                        label="User"
                        sortKey="email"
                        sort={sort}
                        onSort={applySort}
                        defaultOrder="asc"
                      />
                      <AdminSortableTh
                        label="Method"
                        sortKey="method"
                        sort={sort}
                        onSort={applySort}
                        defaultOrder="asc"
                      />
                      <AdminSortableTh
                        label="Endpoint"
                        sortKey="endpoint"
                        sort={sort}
                        onSort={applySort}
                        defaultOrder="asc"
                      />
                      <AdminSortableTh
                        label="Status"
                        sortKey="status_code"
                        sort={sort}
                        onSort={applySort}
                      />
                      <AdminSortableTh
                        label="Latency"
                        sortKey="response_time_ms"
                        sort={sort}
                        onSort={applySort}
                      />
                    </tr>
                  </thead>
                  <tbody className={loading ? 'opacity-60 transition-opacity' : undefined}>
                    {requests.map((r) => (
                      <tr
                        key={r.id}
                        className="dashboard-table-row-clickable"
                        onClick={() => setSelected(r)}
                      >
                        <td className="whitespace-nowrap text-ink-muted text-xs">
                          {new Date(r.created_at).toLocaleString()}
                        </td>
                        <td className="max-w-[160px] truncate">
                          {r.user_id ? (
                            <Link
                              href={`/admin/users/${r.user_id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="hover:text-brand-strong hover:underline"
                            >
                              {r.email || `#${r.user_id}`}
                            </Link>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="font-mono text-xs text-ink-dim">{r.method}</td>
                        <td className="font-mono text-xs max-w-[260px] truncate" title={r.endpoint}>
                          {r.endpoint}
                        </td>
                        <td>
                          <AdminHttpStatusBadge code={r.status_code} />
                        </td>
                        <td className="tabular-nums">{formatMs(r.response_time_ms)}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </AdminTable>
              </AdminTableWrap>
            </AdminPanelBody>
            <AdminPagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
              onPageSizeChange={applyPageSize}
              pageSizeOptions={[25, 50, 100, 200]}
              loading={loading}
              noun="requests"
            />
          </>
        )}
      </AdminPanel>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request #{selected?.id}</DialogTitle>
          </DialogHeader>
          {selected && (
            <AdminDetailGrid
              items={[
                { label: 'Endpoint', value: `${selected.method} ${selected.endpoint}`, mono: true },
                { label: 'Status', value: <AdminHttpStatusBadge code={selected.status_code} /> },
                { label: 'Response time', value: `${formatMs(selected.response_time_ms)}ms` },
                {
                  label: 'User',
                  value: selected.user_id ? (
                    <Link
                      href={`/admin/users/${selected.user_id}`}
                      className="text-brand-strong hover:underline"
                    >
                      {selected.email || `#${selected.user_id}`}
                    </Link>
                  ) : (
                    '—'
                  ),
                },
                { label: 'API key', value: String(selected.api_key_id ?? '—') },
                { label: 'IP address', value: selected.ip_address || '—', mono: true },
                { label: 'Timestamp', value: new Date(selected.created_at).toLocaleString() },
              ]}
            />
          )}
        </DialogContent>
      </Dialog>
    </AdminPage>
  )
}

export default function AdminRequestsPage() {
  // useSearchParams (for the ?user_id deep link) needs a Suspense boundary.
  return (
    <Suspense
      fallback={
        <AdminPage>
          <DashboardLoading message="Loading request log…" />
        </AdminPage>
      }
    >
      <AdminRequestsContent />
    </Suspense>
  )
}
