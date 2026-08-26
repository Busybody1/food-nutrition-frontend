'use client'

import { useCallback, useEffect, useState } from 'react'
import { adminAPI, AuditEntry, formatAuditTarget } from '@/lib/api/admin'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FileSearch, Filter, RotateCcw } from 'lucide-react'
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
  DashboardLoading,
  DashboardAlert,
  DashboardEmpty,
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
    load()
  }, [load])

  // Reset paging in the setters, not an effect, so each change fetches once.
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
          <Button variant="outline" size="sm" className="ml-3" onClick={load}>
            Retry
          </Button>
        </DashboardAlert>
      )}

      <AdminPanel>
        <AdminPanelHeader title="Filter" icon={Filter} />
        <AdminPanelBody>
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <AdminFilterField label="Action contains" className="flex-1">
              <Input
                placeholder="e.g. user.patch, settings.update"
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyAction(actionInput.trim())}
              />
            </AdminFilterField>
            <div className="flex gap-2 self-end">
              <Button onClick={() => applyAction(actionInput.trim())}>Apply</Button>
              {actionFilter && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setActionInput('')
                    applyAction('')
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </AdminPanelBody>
      </AdminPanel>

      <AdminPanel>
        <AdminPanelHeader
          title="Recent actions"
          icon={FileSearch}
          actions={
            <span className="text-xs text-ink-muted tabular-nums">
              {total.toLocaleString()} entries
            </span>
          }
        />
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
                        <td className="whitespace-nowrap text-xs text-ink-muted">
                          {new Date(e.created_at).toLocaleString()}
                        </td>
                        <td className="max-w-[180px] truncate">
                          {e.admin_email || e.admin_user_id}
                        </td>
                        <td>
                          <code className="text-xs bg-surface-elevated px-1.5 py-0.5 rounded">
                            {e.action}
                          </code>
                        </td>
                        <td className="text-xs text-ink-muted">
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
