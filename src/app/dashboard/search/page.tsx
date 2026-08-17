'use client'

import { useState } from 'react'
import { api } from '@/lib/api/client'
import { normalizeListPayload } from '@/lib/api/paginated'
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
  category_name?: string
  calories_100g?: number
  protein_100g?: number
}

function optionalNumber(value: string): number | undefined {
  if (!value.trim()) return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

function formatMacro(value: number | undefined, unit: string): string | null {
  if (value === undefined || !Number.isFinite(value)) return null
  const rounded = Number.isInteger(value) ? String(value) : value.toFixed(1)
  return `${rounded}${unit}`
}

export default function SearchPlaygroundPage() {
  const [query, setQuery] = useState('chicken')
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState('')
  const [brandId, setBrandId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [nutrientId, setNutrientId] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [minCalories, setMinCalories] = useState('')
  const [maxCalories, setMaxCalories] = useState('')
  const [minProtein, setMinProtein] = useState('')
  const [maxProtein, setMaxProtein] = useState('')
  const [results, setResults] = useState<FoodSearchHit[]>([])
  const [suggestions, setSuggestions] = useState<FoodSuggestItem[]>([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [hasSuggested, setHasSuggested] = useState(false)
  const [matchMode, setMatchMode] = useState<'any' | 'all'>('any')
  const [verifiedOnly, setVerifiedOnly] = useState(false)

  const buildFilterParams = (): Record<string, unknown> => {
    const params: Record<string, unknown> = {
      limit: 20,
      match_mode: matchMode,
      verified_only: verifiedOnly,
    }
    if (brand.trim()) params.brand = brand.trim()
    if (category.trim()) params.category = category.trim()
    const bid = optionalNumber(brandId)
    if (bid !== undefined) params.brand_id = bid
    const cid = optionalNumber(categoryId)
    if (cid !== undefined) params.category_id = cid
    const nid = optionalNumber(nutrientId)
    if (nid !== undefined) params.nutrient_id = nid
    const minA = optionalNumber(minAmount)
    if (minA !== undefined) params.min_amount = minA
    const maxA = optionalNumber(maxAmount)
    if (maxA !== undefined) params.max_amount = maxA
    const minCal = optionalNumber(minCalories)
    if (minCal !== undefined) params.min_calories = minCal
    const maxCal = optionalNumber(maxCalories)
    if (maxCal !== undefined) params.max_calories = maxCal
    const minP = optionalNumber(minProtein)
    if (minP !== undefined) params.min_protein = minP
    const maxP = optionalNumber(maxProtein)
    if (maxP !== undefined) params.max_protein = maxP
    return params
  }

  const runSearch = async () => {
    setLoading(true)
    setError(null)
    setSuggestions([])
    setHasSuggested(false)
    try {
      const res = await api.search.foods(query, buildFilterParams())
      setResults(Array.isArray(res.data) ? (res.data as FoodSearchHit[]) : [])
      setTotal(res.total ?? 0)
      setHasSearched(true)
    } catch (e) {
      setResults([])
      setTotal(0)
      setHasSearched(true)
      setError(e instanceof ApiError ? e.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  const runSuggest = async () => {
    if (query.length < 1) return
    setSuggestLoading(true)
    setError(null)
    try {
      const res = await api.search.suggest(query, 10)
      setSuggestions(normalizeListPayload<FoodSuggestItem>(res.data ?? res))
      setHasSuggested(true)
    } catch (e) {
      setSuggestions([])
      setHasSuggested(true)
      setError(e instanceof ApiError ? e.message : 'Suggest failed')
    } finally {
      setSuggestLoading(false)
    }
  }

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Search playground"
        description="Test search and suggest endpoints with brand, category, and nutrient filters."
      />

      <form
        className="dashboard-panel"
        onSubmit={(event) => {
          event.preventDefault()
          void runSearch()
        }}
      >
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
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void runSuggest()}
                disabled={suggestLoading}
                className="gap-2"
              >
                {suggestLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Suggest
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2 block">Brand</label>
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand name" />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2 block">Category</label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category name" />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2 block">Brand ID</label>
              <Input value={brandId} onChange={(e) => setBrandId(e.target.value)} placeholder="e.g. 12" inputMode="numeric" />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2 block">Category ID</label>
              <Input value={categoryId} onChange={(e) => setCategoryId(e.target.value)} placeholder="e.g. 5" inputMode="numeric" />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2 block">Nutrient ID</label>
              <Input value={nutrientId} onChange={(e) => setNutrientId(e.target.value)} placeholder="e.g. 106899" inputMode="numeric" />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2 block">Min amount</label>
              <Input value={minAmount} onChange={(e) => setMinAmount(e.target.value)} placeholder="With nutrient ID" inputMode="decimal" />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2 block">Max amount</label>
              <Input value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} placeholder="With nutrient ID" inputMode="decimal" />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2 block">Calories (min–max)</label>
              <div className="flex gap-2">
                <Input value={minCalories} onChange={(e) => setMinCalories(e.target.value)} placeholder="Min" inputMode="decimal" />
                <Input value={maxCalories} onChange={(e) => setMaxCalories(e.target.value)} placeholder="Max" inputMode="decimal" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2 block">Protein (min–max)</label>
              <div className="flex gap-2">
                <Input value={minProtein} onChange={(e) => setMinProtein(e.target.value)} placeholder="Min" inputMode="decimal" />
                <Input value={maxProtein} onChange={(e) => setMaxProtein(e.target.value)} placeholder="Max" inputMode="decimal" />
              </div>
            </div>
          </div>
        </div>
      </form>

      {error && <DashboardAlert variant="error">{error}</DashboardAlert>}

      {hasSearched && !loading && (
        <p className="text-sm text-ink-muted">
          <span className="font-medium text-ink">{total.toLocaleString()}</span> results
        </p>
      )}

      {hasSuggested && suggestions.length > 0 && (
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2 className="dashboard-panel-title">Suggestions</h2>
          </div>
          <ul className="divide-y divide-surface-border/60">
            {suggestions.map((item, index) => (
              <li key={item.id ?? index} className="px-5 py-3 text-sm text-ink">
                {item.name}
                {item.brand_name ? <span className="text-ink-muted"> · {item.brand_name}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="dashboard-panel overflow-hidden">
        <div className="dashboard-panel-header">
          <h2 className="dashboard-panel-title">Results</h2>
        </div>
        {loading ? (
          <p className="px-5 py-10 text-sm text-ink-muted text-center inline-flex items-center justify-center gap-2 w-full">
            <Loader2 className="h-4 w-4 animate-spin" />
            Searching…
          </p>
        ) : results.length > 0 ? (
          <ul className="divide-y divide-surface-border/60">
            {results.map((item, index) => {
              const calories = formatMacro(item.calories_100g, ' kcal')
              const protein = formatMacro(item.protein_100g, ' g protein')
              return (
                <li key={item.id ?? index} className="px-5 py-3.5 hover:bg-surface-elevated/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-ink">{item.name ?? `Food ${item.id ?? index + 1}`}</span>
                      {item.brand_name && (
                        <span className="text-sm text-ink-muted"> · {item.brand_name}</span>
                      )}
                      {item.category_name && (
                        <span className="text-sm text-ink-muted"> · {item.category_name}</span>
                      )}
                    </div>
                    {(calories || protein) && (
                      <span className="text-xs text-ink-muted shrink-0 tabular-nums">
                        {[calories, protein].filter(Boolean).join(' · ')}
                        <span className="text-ink-dim"> / 100 g</span>
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="px-5 py-10 text-sm text-ink-muted text-center">
            {hasSearched && !error
              ? 'No matching foods for this query.'
              : 'No results yet. Run a search to see data.'}
          </p>
        )}
      </div>
    </DashboardPage>
  )
}
