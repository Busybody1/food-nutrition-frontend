'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { NO_IMAGE_CALORIE, type ImageCalorieAccess } from '@/lib/api/image-calorie'

interface ImageCalorieContextValue {
  access: ImageCalorieAccess
  loading: boolean
  failed: boolean
  refresh: () => Promise<ImageCalorieAccess>
}

const ImageCalorieContext = createContext<ImageCalorieContextValue>({
  access: NO_IMAGE_CALORIE,
  loading: false,
  failed: false,
  refresh: async () => NO_IMAGE_CALORIE,
})

export function ImageCalorieProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [access, setAccess] = useState<ImageCalorieAccess>(NO_IMAGE_CALORIE)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const requestId = useRef(0)

  const refresh = useCallback(async (): Promise<ImageCalorieAccess> => {
    const current = ++requestId.current
    let next: ImageCalorieAccess = NO_IMAGE_CALORIE
    let error = false
    try {
      const { api } = await import('@/lib/api/client')
      next = await api.imageCalorie.access()
    } catch {
      error = true
    }
    if (current === requestId.current) {
      setAccess(next)
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
    setAccess(NO_IMAGE_CALORIE)
    setFailed(false)
    setLoading(false)
  }, [authLoading, isAuthenticated, refresh])

  const value = useMemo<ImageCalorieContextValue>(
    () => ({ access, loading: authLoading || loading, failed, refresh }),
    [access, authLoading, loading, failed, refresh]
  )

  return <ImageCalorieContext.Provider value={value}>{children}</ImageCalorieContext.Provider>
}

export function useImageCalorie(): ImageCalorieContextValue {
  return useContext(ImageCalorieContext)
}
