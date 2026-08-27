'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './use-auth'
import { useRouter } from 'next/navigation'
import { AdminUser as APIAdminUser } from '@/lib/api/admin'

interface AdminUser extends APIAdminUser {
  is_super_admin: boolean
  permissions: string[]
}

interface AdminUserResponse extends APIAdminUser {
  is_super_admin?: boolean
  permissions?: string[]
}

interface AdminAuthState {
  user: AdminUser | null
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  hasPermission: (permission: string) => boolean
}

const ADMIN_PERMISSIONS = {
  // User Management
  VIEW_USERS: 'admin:users:view',
  CREATE_USERS: 'admin:users:create',
  UPDATE_USERS: 'admin:users:update',
  DELETE_USERS: 'admin:users:delete',
  MANAGE_USER_STATUS: 'admin:users:status',

  // Analytics
  VIEW_ANALYTICS: 'admin:analytics:view',
  EXPORT_DATA: 'admin:analytics:export',

  // Monitoring
  VIEW_MONITORING: 'admin:monitoring:view',
  MANAGE_ALERTS: 'admin:monitoring:alerts',
  VIEW_LOGS: 'admin:monitoring:logs',

  // Settings
  VIEW_SETTINGS: 'admin:settings:view',
  UPDATE_SETTINGS: 'admin:settings:update',
  SYSTEM_ACTIONS: 'admin:system:actions',

  // Billing
  VIEW_BILLING: 'admin:billing:view',
  MANAGE_BILLING: 'admin:billing:manage',

  // API Management
  VIEW_API_KEYS: 'admin:api:view',
  MANAGE_API_KEYS: 'admin:api:manage',
  VIEW_RATE_LIMITS: 'admin:api:rate_limits',

  // Reports
  VIEW_REPORTS: 'admin:reports:view',
  GENERATE_REPORTS: 'admin:reports:generate',

  VIEW_SUPPORT: 'admin:support:view',
  REPLY_SUPPORT: 'admin:support:reply',
} as const

const DEFAULT_ADMIN_PERMISSIONS = Object.values(ADMIN_PERMISSIONS)

function buildAdminUser(
  authUser: NonNullable<ReturnType<typeof useAuth>['user']>,
  profile?: Partial<AdminUserResponse>
): AdminUser {
  const permissions =
    profile?.permissions && profile.permissions.length > 0
      ? profile.permissions
      : DEFAULT_ADMIN_PERMISSIONS

  return {
    id: authUser.id,
    email: authUser.email,
    first_name: authUser.first_name,
    last_name: authUser.last_name,
    company_name: authUser.company_name,
    is_active: true,
    is_admin: true,
    email_verified: authUser.email_verified,
    created_at: authUser.created_at,
    plan_name: profile?.plan_name,
    is_super_admin: profile?.is_super_admin ?? false,
    permissions,
  }
}

function buildHasPermission(permissions: string[]) {
  return (permission: string): boolean => permissions.includes(permission)
}

export function useAdmin(): AdminAuthState {
  const { user: authUser, isAuthenticated: authIsAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()

  const [adminState, setAdminState] = useState<AdminAuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isAdmin: false,
    isSuperAdmin: false,
    hasPermission: () => false
  })

  const checkAdminAccess = useCallback(async () => {
    if (authLoading) {
      setAdminState(prev => ({ ...prev, isLoading: true }))
      return
    }

    if (!authIsAuthenticated || !authUser) {
      setAdminState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isAdmin: false,
        isSuperAdmin: false,
        hasPermission: () => false
      })
      return
    }

    if (!authUser.is_admin) {
      setAdminState({
        user: null,
        isAuthenticated: true,
        isLoading: false,
        isAdmin: false,
        isSuperAdmin: false,
        hasPermission: () => false
      })
      return
    }

    const adminUser = buildAdminUser(authUser)
    const permissions = adminUser.permissions

    setAdminState({
      user: adminUser,
      isAuthenticated: true,
      isLoading: false,
      isAdmin: true,
      isSuperAdmin: adminUser.is_super_admin,
      hasPermission: buildHasPermission(permissions)
    })

    try {
      const { adminAPI } = await import('@/lib/api/admin')
      const profile = await adminAPI.getAdminUser(authUser.id) as AdminUserResponse
      const enrichedUser = buildAdminUser(authUser, profile)
      setAdminState({
        user: enrichedUser,
        isAuthenticated: true,
        isLoading: false,
        isAdmin: true,
        isSuperAdmin: enrichedUser.is_super_admin,
        hasPermission: buildHasPermission(enrichedUser.permissions)
      })
    } catch {
      // Profile enrichment is optional; session admin access is sufficient.
    }
  }, [authLoading, authIsAuthenticated, authUser])

  useEffect(() => {
    checkAdminAccess()
  }, [checkAdminAccess])

  useEffect(() => {
    if (authLoading || adminState.isLoading) return

    if (!authIsAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (!adminState.isAdmin) {
      router.push('/dashboard')
    }
  }, [
    authLoading,
    authIsAuthenticated,
    adminState.isLoading,
    adminState.isAdmin,
    router
  ])

  return adminState
}

// Hook for checking specific permissions
export function useAdminPermission(permission: string): boolean {
  const { hasPermission } = useAdmin()
  return hasPermission(permission)
}

// Hook for admin-only components
export function useRequireAdmin() {
  const { isAdmin, isLoading } = useAdmin()

  if (!isLoading && !isAdmin) {
    throw new Error('Admin access required')
  }

  return { isAdmin, isLoading }
}

// Hook for super admin-only components
export function useRequireSuperAdmin() {
  const { isSuperAdmin, isLoading } = useAdmin()

  if (!isLoading && !isSuperAdmin) {
    throw new Error('Super admin access required')
  }

  return { isSuperAdmin, isLoading }
}

// Permission constants for easy use
export { ADMIN_PERMISSIONS }
