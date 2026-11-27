'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { NO_ENTERPRISE, type EnterpriseAccountView } from '@/lib/enterprise/model'

interface EnterpriseContextValue {
  view: EnterpriseAccountView
  loading: boolean
  failed: boolean
  refresh: () => Promise<EnterpriseAccountView>
}

const EnterpriseContext = createContext<EnterpriseContextValue>({
  view: NO_ENTERPRISE,
  loading: false,
  failed: false,
  refresh: async () => NO_ENTERPRISE,
})

export function EnterpriseProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [view, setView] = useState<EnterpriseAccountView>(NO_ENTERPRISE)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const requestId = useRef(0)

  const refresh = useCallback(async (): Promise<EnterpriseAccountView> => {
    const current = ++requestId.current
    let next: EnterpriseAccountView = NO_ENTERPRISE
    let error = false
    try {
      const { api } = await import('@/lib/api/client')
      next = await api.enterprise.view()
    } catch {
      error = true
    }
    if (current === requestId.current) {
      setView(next)
      setFailed(error)
      setLoading(false)
    }
    return next
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (isAuthenticated) {
      void refresh()
      return
    }
    requestId.current += 1
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setView(NO_ENTERPRISE)
    setFailed(false)
    setLoading(false)
  }, [authLoading, isAuthenticated, refresh])

  const value = useMemo<EnterpriseContextValue>(
    () => ({ view, loading: authLoading || loading, failed, refresh }),
    [view, authLoading, loading, failed, refresh]
  )

  return <EnterpriseContext.Provider value={value}>{children}</EnterpriseContext.Provider>
}

export function useEnterprise(): EnterpriseContextValue {
  return useContext(EnterpriseContext)
}
