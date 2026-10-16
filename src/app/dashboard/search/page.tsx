'use client'

import Link from 'next/link'
import { useState } from 'react'
import { api } from '@/lib/api/client'
import { normalizeListPayload } from '@/lib/api/paginated'
import { ApiError } from '@/types/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DASHBOARD_ICON_STROKE,
  DashboardAlert,
  DashboardEmpty,
  DashboardIconTile,
  DashboardLoading,
  DashboardPage,
  DashboardPageHeader,
  DashboardPanel,
  DashboardPanelBody,
  DashboardPanelHeader,
  DashboardTable,
  DashboardTableWrap,
} from '@/components/dashboard/dashboard-shell'
import { ListFilter, Loader2, Search, Sparkles, UtensilsCrossed } from 'lucide-react'

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

function searchFailure(error: unknown, fallback: string): { message: string; mcpOnly: boolean } {
  if (error instanceof ApiError && error.status === 403) {
    return {
      message: 'This plan calls MCP tools only. It does not include REST search.',
      mcpOnly: true,
    }
  }
  return {
    message: error instanceof ApiError ? error.message : fallback,
    mcpOnly: false,
  }
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
  const [mcpOnly, setMcpOnly] = useState(false)
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
    setMcpOnly(false)
    setSuggestions([])
    setHasSuggested(false)
    try {
      const res = await api.search.foods(query, buildFilterParams())
      setResults(Array.isArray(res.data) ? (res.data as FoodSearchHit[]) : [])
      setTotal(res.total ?? 0)
      setHasSearched(true)
    } catch (e) {
      const failure = searchFailure(e, 'Search failed')
      setResults([])
      setTotal(0)
      setHasSearched(true)
      setError(failure.message)
      setMcpOnly(failure.mcpOnly)
    } finally {
      setLoading(false)
    }
  }

  const runSuggest = async () => {
    if (query.length < 1) return
    setSuggestLoading(true)
    setError(null)
    setMcpOnly(false)
    try {
      const res = await api.search.suggest(query, 10)
      setSuggestions(normalizeListPayload<FoodSuggestItem>(res.data ?? res))
      setHasSuggested(true)
    } catch (e) {
      const failure = searchFailure(e, 'Suggest failed')
      setSuggestions([])
      setHasSuggested(true)
      setError(failure.message)
      setMcpOnly(failure.mcpOnly)
    } finally {
      setSuggestLoading(false)
    }
  }

  const resultsPanel = (
    <DashboardPanel>
      <DashboardPanelHeader
        title="Results"
        icon={ListFilter}
        description="Calories and protein per 100 g"
        actions={
          hasSearched && !loading ? (
            <span className="dashboard-meta-pill">
              <span className="font-semibold tabular-nums text-dash-ink">{total.toLocaleString()}</span> results
            </span>
          ) : undefined
        }
      />
      {error && (
        <div className="px-5 pb-3">
          <DashboardAlert variant="error">
            <span>
              {error}
              {mcpOnly ? (
                <>
                  {' '}
                  <Link href="/docs/mcp" className="font-medium underline">
                    How to connect
                  </Link>
                </>
              ) : null}
            </span>
          </DashboardAlert>
        </div>
      )}
      <DashboardPanelBody flush>
        {loading ? (
          <DashboardLoading message="Searching…" className="min-h-[200px] border-t border-dash-border" />
        ) : results.length > 0 ? (
          <DashboardTableWrap>
            <DashboardTable className="min-w-[640px]">
              <thead>
                <tr>
                  <th>Food</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th className="dashboard-num">Calories</th>
                  <th className="dashboard-num">Protein</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item, index) => {
                  const calories = formatMacro(item.calories_100g, ' kcal')
                  const protein = formatMacro(item.protein_100g, ' g')
                  return (
                    <tr key={item.id ?? index}>
                      <td>
                        <div className="flex min-w-0 items-center gap-3">
                          <DashboardIconTile icon={UtensilsCrossed} tone="brand" className="h-8 w-8" />
                          <span className="font-medium text-dash-ink">
                            {item.name ?? `Food ${item.id ?? index + 1}`}
                          </span>
                        </div>
                      </td>
                      <td className={item.brand_name ? undefined : 'text-dash-dim'}>
                        {item.brand_name || '—'}
                      </td>
                      <td className={item.category_name ? undefined : 'text-dash-dim'}>
                        {item.category_name || '—'}
                      </td>
                      <td className="dashboard-num whitespace-nowrap font-medium text-dash-ink">
                        {calories ?? '—'}
                      </td>
                      <td className="dashboard-num whitespace-nowrap">{protein ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </DashboardTable>
          </DashboardTableWrap>
        ) : (
          <DashboardEmpty
            icon={Search}
            className="border-t border-dash-border"
            title={
              hasSearched && !error
                ? 'No matching foods for this query.'
                : 'No results yet. Run a search to see data.'
            }
          />
        )}
      </DashboardPanelBody>
    </DashboardPanel>
  )

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
        <div className="flex flex-col gap-3 p-5 lg:flex-row lg:items-end">
          <div className="min-w-0 flex-1 sm:min-w-[200px]">
            <label htmlFor="search-query" className="dashboard-field-label">
              Query
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dash-dim"
                strokeWidth={DASHBOARD_ICON_STROKE}
                aria-hidden
              />
              <Input
                id="search-query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. chicken breast"
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-[10px] border border-dash-border bg-white px-3 text-[13px] font-medium text-dash-body shadow-dash">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded accent-dash-teal-strong"
              />
              Verified only
            </label>
            <select
              className="dashboard-select"
              aria-label="Match mode"
              value={matchMode}
              onChange={(e) => setMatchMode(e.target.value as 'any' | 'all')}
            >
              <option value="any">Match: any</option>
              <option value="all">Match: all</option>
            </select>
            <Button type="submit" size="sm" disabled={loading} className="h-9 gap-1.5">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={DASHBOARD_ICON_STROKE} />
              ) : (
                <Search className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
              )}
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void runSuggest()}
              disabled={suggestLoading}
              className="h-9 gap-1.5"
            >
              {suggestLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={DASHBOARD_ICON_STROKE} />
              ) : (
                <Sparkles className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
              )}
              Suggest
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-dash-border px-5 pb-5 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="search-brand" className="dashboard-field-label">Brand</label>
            <Input id="search-brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand name" />
          </div>
          <div>
            <label htmlFor="search-category" className="dashboard-field-label">Category</label>
            <Input id="search-category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category name" />
          </div>
          <div>
            <label htmlFor="search-brand-id" className="dashboard-field-label">Brand ID</label>
            <Input id="search-brand-id" value={brandId} onChange={(e) => setBrandId(e.target.value)} placeholder="e.g. 12" inputMode="numeric" />
          </div>
          <div>
            <label htmlFor="search-category-id" className="dashboard-field-label">Category ID</label>
            <Input id="search-category-id" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} placeholder="e.g. 5" inputMode="numeric" />
          </div>
          <div>
            <label htmlFor="search-nutrient-id" className="dashboard-field-label">Nutrient ID</label>
            <Input id="search-nutrient-id" value={nutrientId} onChange={(e) => setNutrientId(e.target.value)} placeholder="e.g. 106899" inputMode="numeric" />
          </div>
          <div>
            <label htmlFor="search-min-amount" className="dashboard-field-label">Min amount</label>
            <Input id="search-min-amount" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} placeholder="With nutrient ID" inputMode="decimal" />
          </div>
          <div>
            <label htmlFor="search-max-amount" className="dashboard-field-label">Max amount</label>
            <Input id="search-max-amount" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} placeholder="With nutrient ID" inputMode="decimal" />
          </div>
          <div>
            <p className="dashboard-field-label">Calories (min–max)</p>
            <div className="flex gap-2">
              <Input value={minCalories} onChange={(e) => setMinCalories(e.target.value)} placeholder="Min" inputMode="decimal" aria-label="Min calories" />
              <Input value={maxCalories} onChange={(e) => setMaxCalories(e.target.value)} placeholder="Max" inputMode="decimal" aria-label="Max calories" />
            </div>
          </div>
          <div>
            <p className="dashboard-field-label">Protein (min–max)</p>
            <div className="flex gap-2">
              <Input value={minProtein} onChange={(e) => setMinProtein(e.target.value)} placeholder="Min" inputMode="decimal" aria-label="Min protein" />
              <Input value={maxProtein} onChange={(e) => setMaxProtein(e.target.value)} placeholder="Max" inputMode="decimal" aria-label="Max protein" />
            </div>
          </div>
        </div>
      </form>

      {hasSuggested && suggestions.length > 0 ? (
        <div className="dashboard-grid-narrow-wide">
          <DashboardPanel>
            <DashboardPanelHeader title="Suggestions" icon={Sparkles} />
            <DashboardPanelBody flush>
              <DashboardTableWrap>
                <DashboardTable>
                  <thead>
                    <tr>
                      <th>Food</th>
                      <th>Brand</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suggestions.map((item, index) => (
                      <tr key={item.id ?? index}>
                        <td className="font-medium text-dash-ink">{item.name}</td>
                        <td className={item.brand_name ? undefined : 'text-dash-dim'}>
                          {item.brand_name || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </DashboardTable>
              </DashboardTableWrap>
            </DashboardPanelBody>
          </DashboardPanel>
          {resultsPanel}
        </div>
      ) : (
        resultsPanel
      )}
    </DashboardPage>
  )
}
