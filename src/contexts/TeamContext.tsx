'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { NO_TEAM, type TeamMe, type TeamRole, type TeamState } from '@/lib/api/team'

interface TeamContextValue {
  role: TeamRole
  teamAvailable: boolean
  state: TeamState
  me: TeamMe
  loading: boolean
  refresh: () => Promise<TeamMe>
}

const TeamContext = createContext<TeamContextValue>({
  role: 'none',
  teamAvailable: false,
  state: null,
  me: NO_TEAM,
  loading: false,
  refresh: async () => NO_TEAM,
})

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [me, setMe] = useState<TeamMe>(NO_TEAM)
  const [loading, setLoading] = useState(true)
  const requestId = useRef(0)

  const refresh = useCallback(async (): Promise<TeamMe> => {
    const current = ++requestId.current
    let next: TeamMe = NO_TEAM
    try {
      const { api } = await import('@/lib/api/client')
      next = await api.team.me()
    } catch {
      next = NO_TEAM
    }
    if (current === requestId.current) {
      setMe(next)
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
    setMe(NO_TEAM)
    setLoading(false)
  }, [authLoading, isAuthenticated, refresh])

  const value = useMemo<TeamContextValue>(
    () => ({
      role: me.role,
      teamAvailable: me.team_available,
      state: me.state,
      me,
      loading: authLoading || loading,
      refresh,
    }),
    [me, authLoading, loading, refresh]
  )

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>
}

export function useTeam(): TeamContextValue {
  return useContext(TeamContext)
}
