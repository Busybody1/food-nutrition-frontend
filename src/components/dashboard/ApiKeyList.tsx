'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ApiKeyCard } from './ApiKeyCard'
import { CreateApiKeyModal } from './CreateApiKeyModal'
import {
  DashboardPageHeader,
  DashboardStatCard,
  DashboardEmpty,
} from './dashboard-shell'
import {
  Key, Plus, RefreshCw,
  Search, Filter, SortAsc, SortDesc
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { ApiKeyRecord, CreatedApiKeyResult } from '@/lib/api/api-keys'

interface ApiKeyListProps {
  apiKeys: ApiKeyRecord[]
  onRefresh: () => void
  onCreate: (name: string) => Promise<CreatedApiKeyResult | void>
  onDelete: (id: number) => Promise<void>
  isLoading?: boolean
  maxKeys?: number
  currentKeys?: number
  emailVerified?: boolean
}

export function ApiKeyList({
  apiKeys,
  onRefresh,
  onCreate,
  onDelete,
  isLoading = false,
  maxKeys = 1,
  currentKeys = 0,
  emailVerified = true,
}: ApiKeyListProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'last_used_at'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [visibleKeys, setVisibleKeys] = useState<Set<number>>(new Set())

  const canCreateMore = currentKeys < maxKeys && emailVerified

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

  const handleSort = (field: 'name' | 'created_at' | 'last_used_at') => {
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

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="API keys"
        description="Authenticate requests with secret keys. Rotate regularly for production apps."
      >
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          disabled={!canCreateMore || isLoading}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create key
        </Button>
      </DashboardPageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardStatCard label="Total keys" value={currentKeys} icon={Key} accent="brand" />
        <DashboardStatCard
          label="Active"
          value={apiKeys.filter((k) => k.is_active).length}
          accent="green"
        />
        <DashboardStatCard
          label="Slots left"
          value={maxKeys - currentKeys}
          hint={`${maxKeys} max on your plan`}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-dim" />
          <Input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['name', 'created_at', 'last_used_at'] as const).map((field) => (
            <Button
              key={field}
              variant={sortBy === field ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => handleSort(field)}
              className="gap-1 capitalize"
            >
              <Filter className="h-3.5 w-3.5" />
              {field.replace('_', ' ')}
              {sortBy === field &&
                (sortOrder === 'asc' ? (
                  <SortAsc className="h-3.5 w-3.5" />
                ) : (
                  <SortDesc className="h-3.5 w-3.5" />
                ))}
            </Button>
          ))}
        </div>
      </div>

      {filteredAndSortedKeys.length === 0 ? (
        <div className="dashboard-panel">
          <DashboardEmpty
            icon={Key}
            title={searchTerm ? 'No keys match your search' : 'No API keys yet'}
            description={
              searchTerm
                ? 'Try a different search term.'
                : 'Create your first key to start calling the API.'
            }
            action={
              !searchTerm && canCreateMore ? (
                <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create your first key
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedKeys.map((apiKey) => (
            <ApiKeyCard
              key={apiKey.id}
              apiKey={apiKey}
              onDelete={onDelete}
              onToggleVisibility={toggleVisibility}
              isVisible={visibleKeys.has(apiKey.id)}
            />
          ))}
        </div>
      )}

      <CreateApiKeyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateKey}
        isLoading={isLoading}
      />
    </div>
  )
}
