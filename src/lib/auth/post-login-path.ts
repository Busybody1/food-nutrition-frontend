import type { User } from '@/types/auth'

/** Route after successful login or when an authenticated user hits /auth/login */
export function getPostLoginPath(user: Pick<User, 'is_admin'> | null | undefined): string {
  return user?.is_admin ? '/admin' : '/dashboard'
}

/** Header "Dashboard" link and primary app home for the current user */
export function getDashboardPath(user: Pick<User, 'is_admin'> | null | undefined): string {
  return getPostLoginPath(user)
}

export function isDashboardPathActive(
  pathname: string | null,
  user: Pick<User, 'is_admin'> | null | undefined
): boolean {
  if (!pathname) return false
  const base = getDashboardPath(user)
  return pathname === base || pathname.startsWith(`${base}/`)
}
