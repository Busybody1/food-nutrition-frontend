'use client'

import { useEffect, useState } from 'react'
import { loadTrialOffer } from '@/lib/stripe/api'
import { useAuth } from '@/lib/hooks/use-auth'

export function useTrialOffer(product: 'mcp' | 'rest' = 'mcp') {
  const { user, loading } = useAuth()
  const userId = user?.id ?? null
  const [result, setResult] = useState<{
    userId: number
    trialDays: number | null
    failed: boolean
  } | null>(null)

  useEffect(() => {
    if (loading || userId == null) return
    let cancelled = false
    const requestedId = userId
    loadTrialOffer(product)
      .then((offer) => {
        if (cancelled) return
        setResult({
          userId: requestedId,
          trialDays: offer.requires_card ? offer.trial_days : null,
          failed: false,
        })
      })
      .catch(() => {
        if (cancelled) return
        setResult({ userId: requestedId, trialDays: null, failed: true })
      })
    return () => {
      cancelled = true
    }
  }, [loading, product, userId])

  const ready = result != null && result.userId === userId
  return {
    trialDays: ready ? result.trialDays : null,
    offerPending: userId != null && !ready,
    offerFailed: ready ? result.failed : false,
  }
}
