'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, Edit, 
  Eye, Ban, CheckCircle, Mail, Calendar,
  Users
} from 'lucide-react'
import { adminAPI, AdminUser, ApiRequestRow, UserUsagePayload } from '@/lib/api/admin'
import { AdminLineChart } from '@/components/admin/admin-charts'
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
  AdminFilterField,
  AdminTableWrap,
  AdminTable,
  AdminRefreshButton,
  DashboardLoading,
  DashboardAlert,
  DashboardEmpty,
} from '@/components/admin/admin-ui'

interface UserFilters {
  search: string
  status: 'all' | 'active' | 'inactive'
  plan: 'all' | 'free' | 'basic' | 'core' | 'plus' | 'custom'
  sortBy: 'created_at' | 'last_login' | 'total_requests' | 'email'
  sortOrder: 'asc' | 'desc'
}

export default function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [actionError, setActionError] = useState<string>('')
  const [detailUser, setDetailUser] = useState<AdminUser | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailEditMode, setDetailEditMode] = useState(false)
  const [editIsActive, setEditIsActive] = useState(true)
  const [savingDetail, setSavingDetail] = useState(false)
  const [userUsage, setUserUsage] = useState<UserUsagePayload | null>(null)
  const [userRequests, setUserRequests] = useState<ApiRequestRow[]>([])
  const [userKeys, setUserKeys] = useState<Array<Record<string, unknown>>>([])
  const [feedbackTarget, setFeedbackTarget] = useState<AdminUser | null>(null)
  const [sendingFeedback, setSendingFeedback] = useState(false)
  const [feedbackSuccess, setFeedbackSuccess] = useState<string>('')
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    status: 'all',
    plan: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  })

  const applyFilters = useCallback(() => {
    let filtered = [...users]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchLower) ||
        (user.first_name?.toLowerCase().includes(searchLower) ?? false) ||
        (user.last_name?.toLowerCase().includes(searchLower) ?? false) ||
        (user.company_name?.toLowerCase().includes(searchLower) ?? false)
      )
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => 
        filters.status === 'active' ? user.is_active : !user.is_active
      )
    }

    // Plan filter
    if (filters.plan !== 'all') {
      filtered = filtered.filter(user => 
        user.plan_name?.toLowerCase().includes(filters.plan) ?? false
      )
    }

    setFilteredUsers(filtered)
  }, [users, filters])

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      
      // Import admin API
      const { adminAPI } = await import('@/lib/api/admin')
      
      const response = await adminAPI.getUsers({
        skip: 0,
        limit: 100,
        search: filters.search,
        status: filters.status === 'all' ? undefined : filters.status
      })
      
      setUsers(response.users)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])


  const openUserDetail = async (userId: number, editMode: boolean) => {
    try {
      setActionError('')
      setDetailLoading(true)
      setDetailEditMode(editMode)
      setDetailOpen(true)
      const user = await adminAPI.getUser(userId)
      const [usage, reqs, keys] = await Promise.all([
        adminAPI.getUserUsage(userId, '30d'),
        adminAPI.getUserRequests(userId, 15),
        adminAPI.getUserApiKeys(userId),
      ])
      setDetailUser(user)
      setUserUsage(usage)
      setUserRequests(reqs.requests)
      setUserKeys(keys.api_keys)
      setEditIsActive(user.is_active)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to load user details')
      setDetailOpen(false)
    } finally {
      setDetailLoading(false)
    }
  }

  const closeUserDetail = () => {
    setDetailOpen(false)
    setDetailUser(null)
    setDetailEditMode(false)
    setUserUsage(null)
    setUserRequests([])
    setUserKeys([])
  }

  const saveUserDetail = async () => {
    if (!detailUser) return
    try {
      setSavingDetail(true)
      setActionError('')
      const { adminAPI } = await import('@/lib/api/admin')
      if (editIsActive) {
        await adminAPI.activateUser(detailUser.id)
      } else {
        await adminAPI.deactivateUser(detailUser.id)
      }
      closeUserDetail()
      await loadUsers()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update user')
    } finally {
      setSavingDetail(false)
    }
  }

  const handleUserAction = async (userId: number, action: string) => {
    if (action === 'view') {
      await openUserDetail(userId, false)
      return
    }
    if (action === 'edit') {
      await openUserDetail(userId, true)
      return
    }

    try {
      setActionError('')
      const { adminAPI } = await import('@/lib/api/admin')

      switch (action) {
        case 'activate':
          await adminAPI.activateUser(userId)
          break
        case 'deactivate':
          await adminAPI.deactivateUser(userId)
          break
        default:
          throw new Error(`Unknown action: ${action}`)
      }

      await loadUsers()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : `Failed to ${action} user`)
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

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return
    
    try {
      setActionError('')
      const { adminAPI } = await import('@/lib/api/admin')

      switch (action) {
        case 'activate':
          await Promise.all(selectedUsers.map((id) => adminAPI.activateUser(id)))
          break
        case 'deactivate':
          await Promise.all(selectedUsers.map((id) => adminAPI.deactivateUser(id)))
          break
        default:
          throw new Error(`Unknown bulk action: ${action}`)
      }

      setSelectedUsers([])
      await loadUsers()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : `Failed to ${action} users`)
    }
  }

  const getPlanBadgeColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return 'bg-gray-100 text-gray-800'
      case 'enterprise basic':
        return 'bg-blue-100 text-blue-800'
      case 'enterprise core':
        return 'bg-green-100 text-green-800'
      case 'enterprise plus':
        return 'bg-purple-100 text-purple-800'
      case 'custom':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading && users.length === 0) {
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
        actions={<AdminRefreshButton onClick={loadUsers} loading={isLoading} />}
      />

      {error && users.length === 0 && (
        <DashboardAlert variant="error">{error}</DashboardAlert>
      )}

      {actionError && <DashboardAlert variant="error">{actionError}</DashboardAlert>}
      {feedbackSuccess && (
        <DashboardAlert variant="success">{feedbackSuccess}</DashboardAlert>
      )}

      <AdminStatGrid className="mb-6">
        <DashboardStatCard label="Total users" value={users.length} icon={Users} accent="brand" />
        <DashboardStatCard
          label="Active"
          value={users.filter((u) => u.is_active).length}
          icon={CheckCircle}
          accent="green"
        />
        <DashboardStatCard
          label="New this month"
          value={
            users.filter(
              (u) => new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            ).length
          }
          icon={Mail}
          accent="purple"
        />
        <DashboardStatCard
          label="Logged in (7d)"
          value={
            users.filter(
              (u) =>
                u.last_login &&
                new Date(u.last_login) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length
          }
          icon={Calendar}
          accent="orange"
        />
      </AdminStatGrid>

      <AdminPanel className="mb-6">
        <AdminPanelHeader title="Search & filter" icon={Search} />
        <AdminPanelBody>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users by name, email, or company..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as 'all' | 'active' | 'inactive' }))}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={filters.plan}
                onChange={(e) => setFilters(prev => ({ ...prev, plan: e.target.value as 'all' | 'free' | 'basic' | 'core' | 'plus' | 'custom' }))}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Plans</option>
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="core">Core</option>
                <option value="plus">Plus</option>
                <option value="custom">Custom</option>
              </select>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-')
                  setFilters(prev => ({
                    ...prev,
                    sortBy: sortBy as 'created_at' | 'last_login' | 'total_requests' | 'email',
                    sortOrder: sortOrder as 'asc' | 'desc'
                  }))
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="last_login-desc">Last Login</option>
                <option value="total_requests-desc">Most Requests</option>
                <option value="email-asc">Email A-Z</option>
              </select>
            </div>
          </div>
        </AdminPanelBody>
      </AdminPanel>

      <AdminPanel>
        <AdminPanelHeader
          title={`Users (${filteredUsers.length})`}
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
              </div>
            ) : undefined
          }
        />
        {filteredUsers.length === 0 ? (
          <DashboardEmpty icon={Users} title="No users match your filters" />
        ) : (
          <AdminPanelBody noPadding>
            <AdminTableWrap>
              <AdminTable>
                <thead>
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(filteredUsers.map(u => u.id))
                        } else {
                          setSelectedUsers([])
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(prev => [...prev, user.id])
                          } else {
                            setSelectedUsers(prev => prev.filter(id => id !== user.id))
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.first_name?.[0] || ''}{user.last_name?.[0] || ''}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name || ''} {user.last_name || ''}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">{user.company_name || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <Badge className={getPlanBadgeColor(user.plan_name || '')}>
                          {user.plan_name || 'Unknown'}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          ${user.plan_price || 0}/month
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{formatCount(user.requests_this_month)}</div>
                        <div className="text-xs text-gray-500">
                          {formatCount(user.total_requests)} total
                        </div>
                        <div className="text-xs text-gray-400">
                          {user.api_keys_count || 0} API keys
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Badge 
                          className={user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        >
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {user.is_admin && (
                          <Badge className="bg-purple-100 text-purple-800">
                            Admin
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUserAction(user.id, 'view')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUserAction(user.id, 'edit')}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
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
                          onClick={() => handleUserAction(user.id, user.is_active ? 'deactivate' : 'activate')}
                          className={user.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                        >
                          {user.is_active ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              </AdminTable>
            </AdminTableWrap>
          </AdminPanelBody>
        )}
      </AdminPanel>

      <Dialog open={detailOpen} onOpenChange={(open) => !open && closeUserDetail()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {detailEditMode ? 'Edit user' : 'User details'}
            </DialogTitle>
          </DialogHeader>

          {detailLoading ? (
            <p className="text-sm text-ink-muted py-6 text-center">Loading user...</p>
          ) : detailUser ? (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-dim">Name</p>
                  <p className="text-ink">
                    {detailUser.first_name || '—'} {detailUser.last_name || ''}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-dim">Email</p>
                  <p className="text-ink break-all">{detailUser.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-dim">Company</p>
                  <p className="text-ink">{detailUser.company_name || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-dim">Plan</p>
                  <p className="text-ink">{detailUser.plan_name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-dim">Created</p>
                  <p className="text-ink">
                    {new Date(detailUser.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-dim">Last login</p>
                  <p className="text-ink">
                    {detailUser.last_login
                      ? new Date(detailUser.last_login).toLocaleString()
                      : 'Never'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className={detailUser.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {detailUser.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {detailUser.is_admin && (
                  <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
                )}
                {detailUser.email_verified && (
                  <Badge className="bg-blue-100 text-blue-800">Email verified</Badge>
                )}
              </div>

              {detailEditMode && (
                <label className="flex items-center gap-2 pt-2 border-t border-surface-border/60">
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-ink">Account active</span>
                </label>
              )}

              {userUsage && userUsage.daily.length > 0 && (
                <div className="pt-4 border-t border-surface-border/60">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-dim mb-2">Usage (30d)</p>
                  <AdminLineChart
                    data={userUsage.daily.map((d) => ({
                      date: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
                      requests: d.requests,
                    }))}
                    xKey="date"
                    yKey="requests"
                    height={160}
                  />
                </div>
              )}

              {userKeys.length > 0 && (
                <div className="pt-4 border-t border-surface-border/60">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-dim mb-2">API keys</p>
                  <ul className="space-y-2">
                    {userKeys.map((k) => (
                      <li key={String(k.id)} className="flex justify-between items-center text-xs">
                        <span>{String(k.name || k.id)}</span>
                        {k.is_active ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              if (!detailUser) return
                              await adminAPI.revokeUserApiKey(detailUser.id, Number(k.id))
                              const keys = await adminAPI.getUserApiKeys(detailUser.id)
                              setUserKeys(keys.api_keys)
                            }}
                          >
                            Revoke
                          </Button>
                        ) : (
                          <Badge variant="outline">Revoked</Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {userRequests.length > 0 && (
                <div className="pt-4 border-t border-surface-border/60">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-dim mb-2">Recent calls</p>
                  <ul className="space-y-1 max-h-32 overflow-y-auto font-mono text-xs">
                    {userRequests.map((r) => (
                      <li key={r.id} className="text-ink-muted">
                        {r.status_code} {r.method} {r.endpoint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={closeUserDetail}>
              Close
            </Button>
            {detailEditMode && detailUser && (
              <Button onClick={saveUserDetail} disabled={savingDetail}>
                {savingDetail ? 'Saving...' : 'Save changes'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                The user replies directly to that email (no web form). Replies go to your
                Resend receiving address (<code className="text-xs">*.resend.app</code>) and
                are forwarded to Discord when inbound webhooks are configured.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackTarget(null)} disabled={sendingFeedback}>
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
