'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, Edit, 
  Eye, Ban, CheckCircle, Mail, Calendar,
  Users, UserPlus, Download
} from 'lucide-react'
import { AdminUser } from '@/lib/api/admin'

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
      console.error('Failed to load users:', error)
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


  const handleUserAction = async (userId: number, action: string) => {
    try {
      // Import admin API
      const { adminAPI } = await import('@/lib/api/admin')
      
      switch (action) {
        case 'activate':
          await adminAPI.updateUser(userId, { is_active: true })
          break
        case 'deactivate':
          await adminAPI.updateUser(userId, { is_active: false })
          break
        case 'delete':
          await adminAPI.deleteUser(userId)
          break
        default:
          throw new Error(`Unknown action: ${action}`)
      }
      
      // Reload users after action
      await loadUsers()
    } catch (error) {
      console.error(`Failed to ${action} user:`, error)
      setError(error instanceof Error ? error.message : `Failed to ${action} user`)
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return
    
    try {
      // Import admin API
      const { adminAPI } = await import('@/lib/api/admin')
      
      switch (action) {
        case 'activate':
          await Promise.all(selectedUsers.map(id => adminAPI.updateUser(id, { is_active: true })))
          break
        case 'deactivate':
          await Promise.all(selectedUsers.map(id => adminAPI.updateUser(id, { is_active: false })))
          break
        case 'delete':
          await Promise.all(selectedUsers.map(id => adminAPI.deleteUser(id)))
          break
        default:
          throw new Error(`Unknown bulk action: ${action}`)
      }
      
      // Clear selection and reload users
      setSelectedUsers([])
      await loadUsers()
    } catch (error) {
      console.error(`Failed to ${action} users:`, error)
      setError(error instanceof Error ? error.message : `Failed to ${action} users`)
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error loading users</div>
          <div className="text-sm text-gray-600">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage user accounts, subscriptions, and access permissions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="flex items-center">
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Last 7 Days</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.last_login && new Date(u.last_login) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
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
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Users ({filteredUsers.length})
            </CardTitle>
            {selectedUsers.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedUsers.length} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('activate')}
                >
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('deactivate')}
                >
                  Deactivate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
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
                        <div className="font-medium">{(user.requests_this_month || 0).toLocaleString()}</div>
                        <div className="text-xs text-gray-500">
                          {(user.total_requests || 0).toLocaleString()} total
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
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
