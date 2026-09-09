import type { User } from '@/types/auth'

export function getPostLoginPath(user: Pick<User, 'is_admin'> | null | undefined): string {
  return user?.is_admin ? '/admin' : '/dashboard'
}

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
