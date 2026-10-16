'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Apple, BadgeCheck, CheckCircle2, Inbox, Lock } from 'lucide-react'
import {
  adminAPI,
  type AdminFoodListItem,
  type AdminFoodQueueItem,
  type AdminFoodStats,
} from '@/lib/api/admin'
import { useAdmin } from '@/lib/hooks/use-admin'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminPanelBody,
  AdminPanelHeader,
  AdminPagination,
  AdminRefreshButton,
  AdminSortableTh,
  AdminSortState,
  AdminStatGrid,
  AdminTable,
  AdminTableWrap,
  DashboardAlert,
  DashboardEmpty,
  DashboardIconTile,
  DashboardLoading,
  DashboardPanelToolbar,
  DashboardPill,
  DashboardSearchInput,
  DashboardStatCard,
  RateBar,
  type DashboardTone,
} from '@/components/admin/admin-ui'

const PAGE_SIZE = 25
const SEARCH_DEBOUNCE_MS = 300

type FoodSortKey = 'id' | 'name' | 'kcal'

function issueLabel(value: string): string {
  return value.replaceAll('_', ' ')
}

function formatStat(value: number | null | undefined): string {
  return value == null ? '—' : value.toLocaleString()
}

function severityTone(severity: number): DashboardTone {
  if (severity === 3) return 'rose'
  if (severity === 2) return 'orange'
  return 'neutral'
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
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    if (canView) loadStats()
  }, [canView, loadStats])

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    if (canView && tab === 'queue') loadQueue()
  }, [canView, loadQueue, tab])

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    if (canView && tab === 'all') loadFoods()
  }, [canView, loadFoods, tab])

  if (!canView) {
    return (
      <AdminPage>
        <DashboardAlert variant="error">You do not have permission to view verified foods.</DashboardAlert>
      </AdminPage>
    )
  }

  const verifiedTotal = stats?.total_verified ?? 0

  return (
    <AdminPage>
      <AdminPageHeader
        title="Verified foods"
        description="Review and correct macros for the verified catalog. Amounts are per 100 g."
        actions={<AdminRefreshButton onClick={() => { loadStats(); if (tab === 'queue') loadQueue(); else loadFoods() }} />}
      />
      {statsError && <DashboardAlert variant="error">{statsError}</DashboardAlert>}
      <AdminStatGrid>
        <DashboardStatCard
          label="Verified foods"
          value={formatStat(stats?.total_verified)}
          icon={BadgeCheck}
          accent="brand"
        />
        <DashboardStatCard
          label="Open issues"
          value={formatStat(stats?.open_issues)}
          icon={AlertTriangle}
          accent="orange"
        />
        <DashboardStatCard
          label="Reviewed"
          value={formatStat(stats?.reviewed)}
          icon={CheckCircle2}
          accent="green"
          hint={stats && verifiedTotal > 0 ? 'Share of verified foods' : undefined}
          footer={
            stats && verifiedTotal > 0 ? (
              <RateBar value={(stats.reviewed / verifiedTotal) * 100} />
            ) : undefined
          }
        />
        <DashboardStatCard
          label="Locked"
          value={formatStat(stats?.locked)}
          icon={Lock}
          accent="indigo"
          hint={stats && verifiedTotal > 0 ? 'Share of verified foods' : undefined}
          footer={
            stats && verifiedTotal > 0 ? (
              <RateBar value={(stats.locked / verifiedTotal) * 100} />
            ) : undefined
          }
        />
      </AdminStatGrid>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="queue">Review queue</TabsTrigger>
          <TabsTrigger value="all">All verified</TabsTrigger>
        </TabsList>
        <TabsContent value="queue">
          <AdminPanel>
            <AdminPanelHeader
              title="Review queue"
              icon={Inbox}
              description="Open issues waiting for review."
            />
            <DashboardPanelToolbar>
              <select
                className="dashboard-select w-full sm:w-auto sm:min-w-[220px]"
                aria-label="Issue class"
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
            </DashboardPanelToolbar>
            {queueError && (
              <div className="px-5 pb-3">
                <DashboardAlert variant="error">{queueError}</DashboardAlert>
              </div>
            )}
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
                <AdminPanelBody noPadding>
                  <AdminTableWrap>
                    <AdminTable>
                      <thead>
                        <tr>
                          <th>Food</th>
                          <th>Issue</th>
                          <th>Severity</th>
                          <th>
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {queueItems.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <div className="flex min-w-0 items-center gap-3">
                                <DashboardIconTile icon={Apple} tone="neutral" className="h-8 w-8" />
                                <div className="min-w-0">
                                  <div className="truncate font-medium text-dash-ink">{item.name}</div>
                                  <div className="truncate text-xs text-dash-muted">{item.external_id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="text-dash-ink">{issueLabel(item.issue_class)}</td>
                            <td>
                              <DashboardPill tone={severityTone(item.severity)} className="tabular-nums">
                                {item.severity}
                              </DashboardPill>
                            </td>
                            <td className="text-right">
                              <Button asChild variant="outline" size="sm" className="h-8">
                                <Link href={`/admin/foods/${item.food_id}`}>Edit</Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </AdminTable>
                  </AdminTableWrap>
                </AdminPanelBody>
                <AdminPagination
                  page={queuePage}
                  pageSize={PAGE_SIZE}
                  total={queueTotal}
                  onPageChange={setQueuePage}
                  noun="issues"
                />
              </>
            )}
          </AdminPanel>
        </TabsContent>
        <TabsContent value="all">
          <AdminPanel>
            <AdminPanelHeader title="All verified foods" icon={Apple} />
            <DashboardPanelToolbar>
              <DashboardSearchInput
                className="w-full sm:max-w-md"
                placeholder="Search name or external id"
                value={searchInput}
                onChange={setSearchInput}
              />
            </DashboardPanelToolbar>
            {foodsError && (
              <div className="px-5 pb-3">
                <DashboardAlert variant="error">{foodsError}</DashboardAlert>
              </div>
            )}
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
                <AdminPanelBody noPadding>
                  <AdminTableWrap>
                    <AdminTable>
                      <thead>
                        <tr>
                          <AdminSortableTh label="Name" sortKey="name" sort={sort} onSort={setSort} />
                          <th>External id</th>
                          <AdminSortableTh
                            label="kcal"
                            sortKey="kcal"
                            sort={sort}
                            onSort={setSort}
                            align="right"
                          />
                          <th>Energy check</th>
                          <th>Issues</th>
                          <th>
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {foods.map((food) => {
                          const issues = (food.open_issue_classes ?? []).map(issueLabel)
                          return (
                            <tr key={food.id}>
                              <td className="font-medium text-dash-ink">{food.name}</td>
                              <td className="font-mono text-xs text-dash-muted">{food.external_id}</td>
                              <td className="dashboard-num">{food.kcal ?? '—'}</td>
                              <td>
                                {food.atwater_in_band ? (
                                  <DashboardPill tone="green">in range</DashboardPill>
                                ) : food.atwater_kcal_min != null && food.atwater_kcal_max != null ? (
                                  <DashboardPill tone="orange" className="tabular-nums">
                                    {`${food.atwater_kcal_min}-${food.atwater_kcal_max}`}
                                  </DashboardPill>
                                ) : (
                                  '—'
                                )}
                              </td>
                              <td>
                                {issues.length > 0 ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    {issues.map((label, index) => (
                                      <DashboardPill key={`${label}-${index}`} tone="neutral">
                                        {label}
                                      </DashboardPill>
                                    ))}
                                  </div>
                                ) : (
                                  '—'
                                )}
                              </td>
                              <td className="text-right">
                                <Button asChild variant="outline" size="sm" className="h-8">
                                  <Link href={`/admin/foods/${food.id}`}>Edit</Link>
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </AdminTable>
                  </AdminTableWrap>
                </AdminPanelBody>
                <AdminPagination
                  page={foodsPage}
                  pageSize={PAGE_SIZE}
                  total={foodsTotal}
                  onPageChange={setFoodsPage}
                  noun="foods"
                />
              </>
            )}
          </AdminPanel>
        </TabsContent>
      </Tabs>
    </AdminPage>
  )
}
