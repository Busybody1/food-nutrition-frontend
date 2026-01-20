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
  GENERATE_REPORTS: 'admin:reports:generate'
} as const

export function useAdmin(): AdminAuthState {
  const { user: authUser, isAuthenticated: authIsAuthenticated } = useAuth()
  const router = useRouter()
  
  const [adminState, setAdminState] = useState<AdminAuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isAdmin: false,
    isSuperAdmin: false,
    hasPermission: () => false
  })

  // Check if user has admin privileges
  const checkAdminAccess = useCallback(async () => {
    if (!authIsAuthenticated || !authUser) {
      setAdminState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isAdmin: false,
        isSuperAdmin: false,
        hasPermission: () => false
      }))
      return
    }

    try {
      // Import admin API
      const { adminAPI } = await import('@/lib/api/admin')
      
      // Check admin access via API
      const adminResponse = await adminAPI.getAdminUser(authUser.id) as AdminUserResponse
      const adminUser: AdminUser = {
        ...adminResponse,
        is_super_admin: adminResponse.is_super_admin || false,
        permissions: adminResponse.permissions || []
      }

      const hasPermission = (permission: string): boolean => {
        return adminUser.permissions.includes(permission)
      }

      setAdminState({
        user: adminUser,
        isAuthenticated: true,
        isLoading: false,
        isAdmin: adminUser.is_admin,
        isSuperAdmin: adminUser.is_super_admin,
        hasPermission
      })

    } catch (error) {
      console.error('Failed to check admin access:', error)
      setAdminState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isAdmin: false,
        isSuperAdmin: false,
        hasPermission: () => false
      }))
    }
  }, [authIsAuthenticated, authUser])

  useEffect(() => {
    checkAdminAccess()
  }, [checkAdminAccess])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!adminState.isLoading && !adminState.isAuthenticated) {
      router.push('/auth/login')
    }
  }, [adminState.isLoading, adminState.isAuthenticated, router])

  // Redirect to dashboard if not admin
  useEffect(() => {
    if (!adminState.isLoading && adminState.isAuthenticated && !adminState.isAdmin) {
      router.push('/dashboard')
    }
  }, [adminState.isLoading, adminState.isAuthenticated, adminState.isAdmin, router])

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
