'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ApiKeyRow } from './ApiKeyCard'
import { CreateApiKeyModal } from './CreateApiKeyModal'
import {
  DASHBOARD_ICON_STROKE,
  DashboardAlert,
  DashboardEmpty,
  DashboardPageHeader,
  DashboardPanel,
  DashboardPanelBody,
  DashboardPanelHeader,
  DashboardPanelToolbar,
  DashboardPill,
  DashboardSearchInput,
  DashboardStatCard,
  DashboardTable,
  DashboardTableWrap,
} from './dashboard-shell'
import {
  AlertCircle, ArrowDown, ArrowUp, CheckCircle2, Key, KeyRound, Layers, Plus, RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import {
  resolveApiKeyPlaintext,
  type ApiKeyRecord,
  type CreatedApiKeyResult,
} from '@/lib/api/api-keys'

type SortField = 'name' | 'created_at' | 'last_used_at'

const SORT_FIELDS: { value: SortField; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'created_at', label: 'Created' },
  { value: 'last_used_at', label: 'Last used' },
]

interface ApiKeyListProps {
  apiKeys: ApiKeyRecord[]
  onRefresh: () => void
  onCreate: (name: string) => Promise<CreatedApiKeyResult | void>
  onDelete: (id: number) => Promise<void>
  isLoading?: boolean
  maxKeys?: number
  currentKeys?: number
  accountKeyCount?: number
  emailVerified?: boolean
  title?: string
  description?: string
  emptyDescription?: string
  namePlaceholder?: string
  upgradeHref?: string
}

export function ApiKeyList({
  apiKeys,
  onRefresh,
  onCreate,
  onDelete,
  isLoading = false,
  maxKeys = 1,
  currentKeys = 0,
  accountKeyCount,
  emailVerified = true,
  title = 'API keys',
  description = 'Authenticate requests with secret keys. Rotate regularly for production apps.',
  emptyDescription = 'Create your first key to start calling the API.',
  namePlaceholder,
  upgradeHref,
}: ApiKeyListProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [visibleKeys, setVisibleKeys] = useState<Set<number>>(new Set())

  const usedKeys = accountKeyCount ?? currentKeys
  const canCreateMore = usedKeys < maxKeys && emailVerified

  const filteredAndSortedKeys = apiKeys
    .filter((key) => key.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'created_at':
          aValue = a.created_at ? new Date(a.created_at).getTime() : 0
          bValue = b.created_at ? new Date(b.created_at).getTime() : 0
          break
        case 'last_used_at':
          aValue = a.last_used_at ? new Date(a.last_used_at).getTime() : 0
          bValue = b.last_used_at ? new Date(b.last_used_at).getTime() : 0
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      }
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    })

  const toggleVisibility = (id: number) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const handleCreateKey = async (name: string) => {
    const created = await onCreate(name)
    if (created?.id) {
      setVisibleKeys((prev) => new Set(prev).add(created.id))
    }
  }

  const showsPrivateWarning = filteredAndSortedKeys.some(
    (key) => visibleKeys.has(key.id) && Boolean(resolveApiKeyPlaintext(key.id, key.key))
  )
  const hasHiddenKeys = filteredAndSortedKeys.some(
    (key) => !resolveApiKeyPlaintext(key.id, key.key)
  )

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        title={title}
        description={description}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-9 gap-1.5"
        >
          <RefreshCw
            className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            strokeWidth={DASHBOARD_ICON_STROKE}
          />
          Refresh
        </Button>
        <Button
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          disabled={!canCreateMore || isLoading}
          className="h-9 gap-1.5"
        >
          <Plus className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
          Create key
        </Button>
      </DashboardPageHeader>

      <div className="dashboard-grid-kpi">
        <DashboardStatCard label="Total keys" value={currentKeys} icon={Key} accent="brand" />
        <DashboardStatCard
          label="Active"
          value={apiKeys.filter((k) => k.is_active).length}
          icon={CheckCircle2}
          accent="green"
        />
        <DashboardStatCard
          label="Slots left"
          value={maxKeys - usedKeys}
          hint={`${maxKeys} max on your plan`}
          icon={Layers}
          accent="indigo"
        />
      </div>

      <DashboardPanel>
        <DashboardPanelHeader
          icon={KeyRound}
          title={
            <span className="inline-flex items-center gap-2">
              Keys
              <DashboardPill tone="neutral" className="tabular-nums">
                {apiKeys.length.toLocaleString()}
              </DashboardPill>
            </span>
          }
        />

        <DashboardPanelToolbar>
          <DashboardSearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by name..."
            ariaLabel="Search keys by name"
            className="w-full sm:w-72"
          />
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <span className="text-xs text-dash-dim">Sort by</span>
            <div className="dashboard-segmented" role="group" aria-label="Sort keys">
              {SORT_FIELDS.map((field) => {
                const active = sortBy === field.value
                const DirectionIcon = sortOrder === 'asc' ? ArrowUp : ArrowDown
                return (
                  <button
                    key={field.value}
                    type="button"
                    onClick={() => handleSort(field.value)}
                    aria-pressed={active}
                    className={cn(
                      'dashboard-segmented-btn gap-1',
                      active && 'dashboard-segmented-btn-active'
                    )}
                  >
                    {field.label}
                    {active && (
                      <>
                        <DirectionIcon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                        <span className="sr-only">
                          {sortOrder === 'asc' ? 'ascending' : 'descending'}
                        </span>
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </DashboardPanelToolbar>

        {showsPrivateWarning && (
          <div className="px-5 pb-3">
            <DashboardAlert variant="warning" className="flex-nowrap items-start">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
              <p>
                <span className="font-medium">Keep this key private.</span> Never commit it to git or
                expose it in client-side code.
              </p>
            </DashboardAlert>
          </div>
        )}

        <DashboardPanelBody flush>
          {filteredAndSortedKeys.length === 0 ? (
            <DashboardEmpty
              className="border-t border-dash-border"
              icon={Key}
              title={searchTerm ? 'No keys match your search' : 'No API keys yet'}
              description={
                searchTerm
                  ? 'Try a different search term.'
                  : emptyDescription
              }
              action={
                !searchTerm && canCreateMore ? (
                  <Button
                    size="sm"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="h-9 gap-1.5"
                  >
                    <Plus className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
                    Create your first key
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <DashboardTableWrap>
              <DashboardTable className="min-w-[960px]">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Secret key</th>
                    <th>Status</th>
                    <th>Last used</th>
                    <th className="dashboard-num">Requests</th>
                    <th>Created</th>
                    <th className="w-14">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedKeys.map((apiKey) => (
                    <ApiKeyRow
                      key={apiKey.id}
                      apiKey={apiKey}
                      onDelete={onDelete}
                      onToggleVisibility={toggleVisibility}
                      isVisible={visibleKeys.has(apiKey.id)}
                    />
                  ))}
                </tbody>
              </DashboardTable>
            </DashboardTableWrap>
          )}
        </DashboardPanelBody>

        {hasHiddenKeys && (
          <p className="border-t border-dash-border px-5 py-3 text-xs text-dash-muted">
            The full key is only returned at creation. Save it then or create a new key.
          </p>
        )}
      </DashboardPanel>

      <CreateApiKeyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateKey}
        isLoading={isLoading}
        namePlaceholder={namePlaceholder}
        upgradeHref={upgradeHref}
      />
    </div>
  )
}
