'use client'

import { useCallback, useEffect, useState } from 'react'
import { adminAPI, ApiRequestRow } from '@/lib/api/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { List, Search, RotateCcw } from 'lucide-react'
import { formatCount, formatMs } from '@/lib/utils/format'
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
  AdminHttpStatusBadge,
  AdminDetailGrid,
  AdminRefreshButton,
  DashboardLoading,
  DashboardAlert,
  DashboardEmpty,
} from '@/components/admin/admin-ui'

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<ApiRequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<ApiRequestRow | null>(null)
  const [filters, setFilters] = useState({
    user_id: '',
    endpoint: '',
    method: '',
    status_min: '',
    date_from: '',
    date_to: '',
  })

  const load = useCallback(
    async (beforeId?: number) => {
      if (beforeId) setLoadingMore(true)
      else setLoading(true)
      setError('')
      try {
        const params: Record<string, unknown> = { limit: 50 }
        if (beforeId) params.before_id = beforeId
        if (filters.user_id) params.user_id = Number(filters.user_id)
        if (filters.endpoint) params.endpoint = filters.endpoint
        if (filters.method) params.method = filters.method
        if (filters.status_min) params.status_min = Number(filters.status_min)
        if (filters.date_from) params.date_from = filters.date_from
        if (filters.date_to) params.date_to = filters.date_to
        const data = await adminAPI.getApiRequests(params)
        setRequests(beforeId ? (prev) => [...prev, ...data.requests] : data.requests)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load requests')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [filters]
  )

  useEffect(() => {
    load()
  }, [])

  const lastId = requests.length ? requests[requests.length - 1].id : undefined
  const errorCount = requests.filter((r) => r.status_code >= 400).length

  return (
    <AdminPage>
      <AdminPageHeader
        title="API request log"
        description="Search and inspect every authenticated API call recorded in api_usage."
        actions={
          <AdminRefreshButton onClick={() => load()} loading={loading} />
        }
      />

      {error && (
        <DashboardAlert variant="error">
          {error}
          <Button variant="outline" size="sm" className="ml-3" onClick={() => load()}>
            Retry
          </Button>
        </DashboardAlert>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="dashboard-stat-card">
          <p className="dashboard-stat-label">Showing</p>
          <p className="dashboard-stat-value">{formatCount(requests.length)}</p>
        </div>
        <div className="dashboard-stat-card">
          <p className="dashboard-stat-label">Errors in view</p>
          <p className="dashboard-stat-value text-amber-800">{formatCount(errorCount)}</p>
        </div>
        <div className="dashboard-stat-card hidden sm:block">
          <p className="dashboard-stat-label">Tip</p>
          <p className="dashboard-stat-hint">Click a row for full request details</p>
        </div>
      </div>

      <AdminPanel className="mb-6">
        <AdminPanelHeader title="Filters" icon={Search} />
        <AdminPanelBody>
          <AdminFilterBar>
            <AdminFilterField label="User ID">
              <Input
                placeholder="e.g. 42"
                value={filters.user_id}
                onChange={(e) => setFilters((f) => ({ ...f, user_id: e.target.value }))}
              />
            </AdminFilterField>
            <AdminFilterField label="Endpoint">
              <Input
                placeholder="Contains path…"
                value={filters.endpoint}
                onChange={(e) => setFilters((f) => ({ ...f, endpoint: e.target.value }))}
              />
            </AdminFilterField>
            <AdminFilterField label="HTTP method">
              <Input
                placeholder="GET"
                value={filters.method}
                onChange={(e) => setFilters((f) => ({ ...f, method: e.target.value }))}
              />
            </AdminFilterField>
            <AdminFilterField label="Min status">
              <Input
                placeholder="400"
                value={filters.status_min}
                onChange={(e) => setFilters((f) => ({ ...f, status_min: e.target.value }))}
              />
            </AdminFilterField>
            <AdminFilterField label="From">
              <Input
                type="datetime-local"
                value={filters.date_from}
                onChange={(e) => setFilters((f) => ({ ...f, date_from: e.target.value }))}
              />
            </AdminFilterField>
            <AdminFilterField label="To">
              <Input
                type="datetime-local"
                value={filters.date_to}
                onChange={(e) => setFilters((f) => ({ ...f, date_to: e.target.value }))}
              />
            </AdminFilterField>
          </AdminFilterBar>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button onClick={() => load()}>
              <Search className="h-4 w-4 mr-1.5" />
              Apply filters
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setFilters({
                  user_id: '',
                  endpoint: '',
                  method: '',
                  status_min: '',
                  date_from: '',
                  date_to: '',
                })
                setTimeout(() => load(), 0)
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
              <Button variant="outline" onClick={() => load()}>
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
                      <th>Time</th>
                      <th>User</th>
                      <th>Request</th>
                      <th>Status</th>
                      <th>Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr
                        key={r.id}
                        className="dashboard-table-row-clickable"
                        onClick={() => setSelected(r)}
                      >
                        <td className="whitespace-nowrap text-ink-muted text-xs">
                          {new Date(r.created_at).toLocaleString()}
                        </td>
                        <td className="max-w-[140px] truncate">
                          {r.email || (r.user_id ? `#${r.user_id}` : '—')}
                        </td>
                        <td className="font-mono text-xs max-w-[220px] truncate">
                          <span className="text-ink-dim mr-1">{r.method}</span>
                          {r.endpoint}
                        </td>
                        <td>
                          <AdminHttpStatusBadge code={r.status_code} />
                        </td>
                        <td className="tabular-nums">{formatMs(r.response_time_ms)}</td>
                      </tr>
                    ))}
                  </tbody>
                </AdminTable>
              </AdminTableWrap>
            </AdminPanelBody>
            {lastId && (
              <div className="px-5 py-4 border-t border-surface-border/60 flex justify-center">
                <Button variant="outline" onClick={() => load(lastId)} disabled={loadingMore}>
                  {loadingMore ? 'Loading…' : 'Load more'}
                </Button>
              </div>
            )}
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
                { label: 'Response time', value: formatMs(selected.response_time_ms) },
                { label: 'User', value: String(selected.email || selected.user_id || '—') },
                { label: 'API key', value: String(selected.api_key_id ?? '—') },
                { label: 'IP address', value: selected.ip_address || '—' },
                { label: 'Timestamp', value: new Date(selected.created_at).toLocaleString() },
              ]}
            />
          )}
        </DialogContent>
      </Dialog>
    </AdminPage>
  )
}
