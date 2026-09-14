'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Apple, Inbox, Search } from 'lucide-react'
import {
  adminAPI,
  type AdminFoodListItem,
  type AdminFoodQueueItem,
  type AdminFoodStats,
} from '@/lib/api/admin'
import { useAdmin } from '@/lib/hooks/use-admin'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminPanelBody,
  AdminPagination,
  AdminRefreshButton,
  AdminSortableTh,
  AdminSortState,
  AdminStatGrid,
  AdminTable,
  AdminTableWrap,
  DashboardAlert,
  DashboardEmpty,
  DashboardLoading,
  DashboardStatCard,
} from '@/components/admin/admin-ui'

const PAGE_SIZE = 25
const SEARCH_DEBOUNCE_MS = 300

type FoodSortKey = 'id' | 'name' | 'kcal'

function issueLabel(value: string): string {
  return value.replaceAll('_', ' ')
}

export default function AdminFoodsPage() {
  const { hasPermission } = useAdmin()
  const canView = hasPermission('admin:foods:view')
  const [tab, setTab] = useState('queue')
  const [stats, setStats] = useState<AdminFoodStats | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)

  const [queueItems, setQueueItems] = useState<AdminFoodQueueItem[]>([])
  const [queueTotal, setQueueTotal] = useState(0)
  const [queuePage, setQueuePage] = useState(1)
  const [queueLoading, setQueueLoading] = useState(true)
  const [queueError, setQueueError] = useState<string | null>(null)
  const [issueFilter, setIssueFilter] = useState('')

  const [foods, setFoods] = useState<AdminFoodListItem[]>([])
  const [foodsTotal, setFoodsTotal] = useState(0)
  const [foodsPage, setFoodsPage] = useState(1)
  const [foodsLoading, setFoodsLoading] = useState(false)
  const [foodsError, setFoodsError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sort, setSort] = useState<AdminSortState<FoodSortKey>>({ key: 'id', order: 'asc' })

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setFoodsPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const loadStats = useCallback(async () => {
    try {
      setStatsError(null)
      setStats(await adminAPI.getFoodStats())
    } catch (error) {
      setStatsError(error instanceof Error ? error.message : 'Failed to load stats')
    }
  }, [])

  const loadQueue = useCallback(async () => {
    try {
      setQueueLoading(true)
      setQueueError(null)
      const skip = (queuePage - 1) * PAGE_SIZE
      const res = await adminAPI.getFoodReviewQueue({
        skip,
        limit: PAGE_SIZE,
        status: 'open',
        issue_class: issueFilter || undefined,
      })
      setQueueItems(res.items)
      setQueueTotal(res.total)
    } catch (error) {
      setQueueError(error instanceof Error ? error.message : 'Failed to load review queue')
    } finally {
      setQueueLoading(false)
    }
  }, [issueFilter, queuePage])

  const loadFoods = useCallback(async () => {
    try {
      setFoodsLoading(true)
      setFoodsError(null)
      const skip = (foodsPage - 1) * PAGE_SIZE
      const res = await adminAPI.getFoods({
        skip,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        sort_by: sort.key,
        sort_order: sort.order,
      })
      setFoods(res.items)
      setFoodsTotal(res.total)
    } catch (error) {
      setFoodsError(error instanceof Error ? error.message : 'Failed to load foods')
    } finally {
      setFoodsLoading(false)
    }
  }, [debouncedSearch, foodsPage, sort])

  useEffect(() => {
    if (canView) loadStats()
  }, [canView, loadStats])

  useEffect(() => {
    if (canView && tab === 'queue') loadQueue()
  }, [canView, loadQueue, tab])

  useEffect(() => {
    if (canView && tab === 'all') loadFoods()
  }, [canView, loadFoods, tab])

  if (!canView) {
    return (
      <AdminPage>
        <DashboardAlert variant="error">You do not have permission to view verified foods.</DashboardAlert>
      </AdminPage>
    )
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Verified foods"
        description="Review and correct macros for the verified catalog. Amounts are per 100 g."
        actions={<AdminRefreshButton onClick={() => { loadStats(); if (tab === 'queue') loadQueue(); else loadFoods() }} />}
      />
      {statsError && <DashboardAlert variant="error">{statsError}</DashboardAlert>}
      <AdminStatGrid>
        <DashboardStatCard label="Verified foods" value={stats?.total_verified ?? '—'} />
        <DashboardStatCard label="Open issues" value={stats?.open_issues ?? '—'} />
        <DashboardStatCard label="Reviewed" value={stats?.reviewed ?? '—'} />
        <DashboardStatCard label="Locked" value={stats?.locked ?? '—'} />
      </AdminStatGrid>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="queue">Review queue</TabsTrigger>
          <TabsTrigger value="all">All verified</TabsTrigger>
        </TabsList>
        <TabsContent value="queue">
          <AdminPanel>
            <AdminPanelBody>
              <div className="flex flex-wrap gap-2 mb-4">
                <select
                  className="h-10 rounded-brand border border-surface-border bg-white px-3 text-sm"
                  value={issueFilter}
                  onChange={(event) => {
                    setIssueFilter(event.target.value)
                    setQueuePage(1)
                  }}
                >
                  <option value="">All issue classes</option>
                  {Object.keys(stats?.by_issue_class ?? {}).map((key) => (
                    <option key={key} value={key}>
                      {issueLabel(key)} ({stats?.by_issue_class[key]})
                    </option>
                  ))}
                </select>
              </div>
              {queueError && <DashboardAlert variant="error">{queueError}</DashboardAlert>}
              {queueLoading ? (
                <DashboardLoading />
              ) : queueItems.length === 0 ? (
                <DashboardEmpty
                  icon={Inbox}
                  title="No open issues"
                  description="The review queue is empty."
                />
              ) : (
                <>
                  <AdminTableWrap>
                    <AdminTable>
                      <thead>
                        <tr>
                          <th>Food</th>
                          <th>Issue</th>
                          <th>Severity</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {queueItems.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-ink-dim">{item.external_id}</div>
                            </td>
                            <td>{issueLabel(item.issue_class)}</td>
                            <td>
                              <Badge variant={item.severity === 3 ? 'destructive' : 'secondary'}>
                                {item.severity}
                              </Badge>
                            </td>
                            <td>
                              <Link className="text-sm text-brand-strong" href={`/admin/foods/${item.food_id}`}>
                                Edit
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </AdminTable>
                  </AdminTableWrap>
                  <AdminPagination
                    page={queuePage}
                    pageSize={PAGE_SIZE}
                    total={queueTotal}
                    onPageChange={setQueuePage}
                    noun="issues"
                  />
                </>
              )}
            </AdminPanelBody>
          </AdminPanel>
        </TabsContent>
        <TabsContent value="all">
          <AdminPanel>
            <AdminPanelBody>
              <div className="relative mb-4 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-dim" />
                <Input
                  className="pl-9"
                  placeholder="Search name or external id"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
              </div>
              {foodsError && <DashboardAlert variant="error">{foodsError}</DashboardAlert>}
              {foodsLoading ? (
                <DashboardLoading />
              ) : foods.length === 0 ? (
                <DashboardEmpty
                  icon={Apple}
                  title="No foods"
                  description="No verified foods matched."
                />
              ) : (
                <>
                  <AdminTableWrap>
                    <AdminTable>
                      <thead>
                        <tr>
                          <AdminSortableTh label="Name" sortKey="name" sort={sort} onSort={setSort} />
                          <th>External id</th>
                          <AdminSortableTh label="kcal" sortKey="kcal" sort={sort} onSort={setSort} />
                          <th>Energy check</th>
                          <th>Issues</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {foods.map((food) => (
                          <tr key={food.id}>
                            <td className="font-medium">{food.name}</td>
                            <td className="text-xs text-ink-dim">{food.external_id}</td>
                            <td>{food.kcal ?? '—'}</td>
                            <td>
                              {food.atwater_in_band
                                ? 'in range'
                                : food.atwater_kcal_min != null && food.atwater_kcal_max != null
                                  ? `${food.atwater_kcal_min}-${food.atwater_kcal_max}`
                                  : '—'}
                            </td>
                            <td>{(food.open_issue_classes ?? []).map(issueLabel).join(', ') || '—'}</td>
                            <td>
                              <Link className="text-sm text-brand-strong" href={`/admin/foods/${food.id}`}>
                                Edit
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </AdminTable>
                  </AdminTableWrap>
                  <AdminPagination
                    page={foodsPage}
                    pageSize={PAGE_SIZE}
                    total={foodsTotal}
                    onPageChange={setFoodsPage}
                    noun="foods"
                  />
                </>
              )}
            </AdminPanelBody>
          </AdminPanel>
        </TabsContent>
      </Tabs>
    </AdminPage>
  )
}
