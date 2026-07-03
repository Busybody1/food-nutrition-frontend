'use client'

import { useEffect, useState } from 'react'
import { adminAPI, AuditEntry } from '@/lib/api/admin'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FileSearch, Filter } from 'lucide-react'
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
  AdminPanelBody,
  AdminFilterField,
  AdminTableWrap,
  AdminTable,
  AdminRefreshButton,
  DashboardLoading,
  DashboardEmpty,
} from '@/components/admin/admin-ui'

export default function AdminAuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [actionFilter, setActionFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    adminAPI
      .getAuditLog({ action: actionFilter || undefined, limit: 100 })
      .then((d) => setEntries(d.entries))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <AdminPage>
      <AdminPageHeader
        title="Audit log"
        description="Immutable record of every mutating action performed in the admin console."
        actions={<AdminRefreshButton onClick={load} loading={loading} />}
      />

      <AdminPanel className="mb-6">
        <AdminPanelHeader title="Filter" icon={Filter} />
        <AdminPanelBody>
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <AdminFilterField label="Action contains" className="flex-1">
              <Input
                placeholder="e.g. user.patch, settings.update"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && load()}
              />
            </AdminFilterField>
            <Button className="self-end" onClick={load}>
              Apply
            </Button>
          </div>
        </AdminPanelBody>
      </AdminPanel>

      <AdminPanel>
        <AdminPanelHeader title="Recent actions" icon={FileSearch} />
        {loading && entries.length === 0 ? (
          <DashboardLoading message="Loading audit log…" />
        ) : entries.length === 0 ? (
          <DashboardEmpty
            icon={FileSearch}
            title="No audit entries"
            description="Actions will appear here when admins change users, plans, or settings."
          />
        ) : (
          <AdminPanelBody noPadding>
            <AdminTableWrap>
              <AdminTable>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Admin</th>
                    <th>Action</th>
                    <th>Target</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e.id}>
                      <td className="whitespace-nowrap text-xs text-ink-muted">
                        {new Date(e.created_at).toLocaleString()}
                      </td>
                      <td className="max-w-[160px] truncate">{e.admin_email || e.admin_user_id}</td>
                      <td>
                        <code className="text-xs bg-surface-elevated px-1.5 py-0.5 rounded">
                          {e.action}
                        </code>
                      </td>
                      <td className="text-xs text-ink-muted">
                        {e.target_type ? `${e.target_type}:${e.target_id ?? '-'}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </AdminTable>
            </AdminTableWrap>
          </AdminPanelBody>
        )}
      </AdminPanel>
    </AdminPage>
  )
}
