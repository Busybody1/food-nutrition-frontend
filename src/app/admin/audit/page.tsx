'use client'

import { useCallback, useEffect, useState } from 'react'
import { adminAPI, AuditEntry, formatAuditTarget } from '@/lib/api/admin'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FileSearch, Filter, RotateCcw, UserRound } from 'lucide-react'
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
  AdminPanelBody,
  AdminFilterField,
  AdminTableWrap,
  AdminTable,
  AdminSortableTh,
  AdminPagination,
  AdminSortState,
  AdminRefreshButton,
  DASHBOARD_ICON_STROKE,
  DashboardLoading,
  DashboardAlert,
  DashboardEmpty,
  DashboardPanelToolbar,
  DashboardPill,
} from '@/components/admin/admin-ui'

type AuditSortKey = 'created_at' | 'action' | 'admin_email' | 'target_type'

export default function AdminAuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [total, setTotal] = useState(0)
  const [actionInput, setActionInput] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sort, setSort] = useState<AdminSortState<AuditSortKey>>({
    key: 'created_at',
    order: 'desc',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminAPI.getAuditLog({
        action: actionFilter || undefined,
        skip: (page - 1) * pageSize,
        limit: pageSize,
        sort_by: sort.key,
        sort_order: sort.order,
      })
      setEntries(data.entries)
      setTotal(data.total ?? data.entries.length)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load audit log')
    } finally {
      setLoading(false)
    }
  }, [actionFilter, page, pageSize, sort])

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    load()
  }, [load])

  const applyAction = (next: string) => {
    setActionFilter(next)
    setPage(1)
  }
  const applySort = (next: AdminSortState<AuditSortKey>) => {
    setSort(next)
    setPage(1)
  }
  const applyPageSize = (next: number) => {
    setPageSize(next)
    setPage(1)
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Audit log"
        description="Immutable record of every mutating action performed in the admin console."
        actions={<AdminRefreshButton onClick={load} loading={loading} />}
      />

      {error && (
        <DashboardAlert variant="error">
          {error}
          <Button variant="outline" size="sm" className="ml-auto h-8" onClick={load}>
            Retry
          </Button>
        </DashboardAlert>
      )}

      <AdminPanel>
        <AdminPanelHeader
          title="Recent actions"
          icon={FileSearch}
          actions={
            <>
              {actionFilter && (
                <DashboardPill tone="outline" icon={Filter} className="max-w-[220px]">
                  <span className="truncate font-mono">{actionFilter}</span>
                </DashboardPill>
              )}
              <span className="dashboard-meta-pill tabular-nums">
                {total.toLocaleString()} entries
              </span>
            </>
          }
        />
        <DashboardPanelToolbar className="sm:flex-nowrap sm:items-end">
          <AdminFilterField label="Action contains" className="w-full sm:max-w-sm">
            <Input
              placeholder="e.g. user.patch, settings.update"
              value={actionInput}
              onChange={(e) => setActionInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyAction(actionInput.trim())}
              className="font-mono"
            />
          </AdminFilterField>
          <div className="flex gap-2">
            <Button size="sm" className="h-9 gap-1.5" onClick={() => applyAction(actionInput.trim())}>
              <Filter className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
              Apply
            </Button>
            {actionFilter && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5"
                onClick={() => {
                  setActionInput('')
                  applyAction('')
                }}
              >
                <RotateCcw className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                Clear
              </Button>
            )}
          </div>
        </DashboardPanelToolbar>
        {loading && entries.length === 0 ? (
          <DashboardLoading message="Loading audit log…" />
        ) : entries.length === 0 ? (
          <DashboardEmpty
            icon={FileSearch}
            title="No audit entries"
            description="Actions will appear here when admins change users, plans, or settings."
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
                        label="Admin"
                        sortKey="admin_email"
                        sort={sort}
                        onSort={applySort}
                        defaultOrder="asc"
                      />
                      <AdminSortableTh
                        label="Action"
                        sortKey="action"
                        sort={sort}
                        onSort={applySort}
                        defaultOrder="asc"
                      />
                      <AdminSortableTh
                        label="Target"
                        sortKey="target_type"
                        sort={sort}
                        onSort={applySort}
                        defaultOrder="asc"
                      />
                    </tr>
                  </thead>
                  <tbody className={loading ? 'opacity-60 transition-opacity' : undefined}>
                    {entries.map((e) => (
                      <tr key={e.id}>
                        <td className="whitespace-nowrap text-xs tabular-nums text-dash-muted">
                          {new Date(e.created_at).toLocaleString()}
                        </td>
                        <td>
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dash-pill text-dash-body"
                              aria-hidden
                            >
                              <UserRound className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
                            </span>
                            <span className="max-w-[180px] truncate font-medium text-dash-ink">
                              {e.admin_email || e.admin_user_id}
                            </span>
                          </div>
                        </td>
                        <td>
                          <DashboardPill tone="neutral" className="font-mono">
                            {e.action}
                          </DashboardPill>
                        </td>
                        <td className="font-mono text-xs text-dash-muted">
                          {formatAuditTarget(e)}
                        </td>
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
              noun="entries"
            />
          </>
        )}
      </AdminPanel>
    </AdminPage>
  )
}
