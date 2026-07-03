'use client'

import { useState } from 'react'
import { api } from '@/lib/api/client'
import { ApiError } from '@/types/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardAlert,
} from '@/components/dashboard/dashboard-shell'
import { Search, Sparkles, Loader2 } from 'lucide-react'

interface FoodSuggestItem {
  id: number
  name: string
  brand_name?: string
}

interface FoodSearchHit {
  id?: number
  name?: string
  brand_name?: string
}

export default function SearchPlaygroundPage() {
  const [query, setQuery] = useState('chicken')
  const [results, setResults] = useState<FoodSearchHit[]>([])
  const [suggestions, setSuggestions] = useState<FoodSuggestItem[]>([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [matchMode, setMatchMode] = useState<'any' | 'all'>('any')
  const [verifiedOnly, setVerifiedOnly] = useState(false)

  const runSearch = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.search.foods(query, {
        limit: 20,
        match_mode: matchMode,
        verified_only: verifiedOnly,
      })
      setResults((res.data || []) as FoodSearchHit[])
      setTotal(res.total ?? 0)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  const runSuggest = async () => {
    if (query.length < 1) return
    try {
      const res = await api.search.suggest(query, 10)
      setSuggestions(Array.isArray(res.data) ? (res.data as FoodSuggestItem[]) : [])
    } catch {
      setSuggestions([])
    }
  }

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Search playground"
        description="Test search and suggest endpoints with your API key or session."
      />

      <div className="dashboard-panel">
        <div className="dashboard-panel-body space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2 block">
                Query
              </label>
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. chicken breast" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-ink-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded border-surface-border text-brand focus:ring-brand/30"
                />
                Verified only
              </label>
              <select
                className="h-10 rounded-brand border border-surface-border bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
                value={matchMode}
                onChange={(e) => setMatchMode(e.target.value as 'any' | 'all')}
              >
                <option value="any">Match: any</option>
                <option value="all">Match: all</option>
              </select>
              <Button onClick={runSearch} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </Button>
              <Button variant="outline" onClick={runSuggest} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Suggest
              </Button>
            </div>
          </div>
        </div>
      </div>

      {error && <DashboardAlert variant="error">{error}</DashboardAlert>}

      {total > 0 && (
        <p className="text-sm text-ink-muted">
          <span className="font-medium text-ink">{total.toLocaleString()}</span> results
        </p>
      )}

      {suggestions.length > 0 && (
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2 className="dashboard-panel-title">Suggestions</h2>
          </div>
          <ul className="divide-y divide-surface-border/60">
            {suggestions.map((s, i) => (
              <li key={s.id ?? i} className="px-5 py-3 text-sm text-ink">
                {s.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="dashboard-panel overflow-hidden">
        <div className="dashboard-panel-header">
          <h2 className="dashboard-panel-title">Results</h2>
        </div>
        {results.length > 0 ? (
          <ul className="divide-y divide-surface-border/60">
            {results.map((item, i) => (
              <li key={item.id ?? i} className="px-5 py-3.5 hover:bg-surface-elevated/50 transition-colors">
                <span className="text-sm font-medium text-ink">{item.name}</span>
                {item.brand_name && (
                  <span className="text-sm text-ink-muted"> · {item.brand_name}</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-10 text-sm text-ink-muted text-center">
            {!loading && !error ? 'No results yet. Run a search to see data.' : null}
          </p>
        )}
      </div>
    </DashboardPage>
  )
}
