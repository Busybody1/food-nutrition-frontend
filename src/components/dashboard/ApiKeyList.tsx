'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ApiKeyCard } from './ApiKeyCard'
import { CreateApiKeyModal } from './CreateApiKeyModal'
import { 
  Key, Plus, RefreshCw, 
  Search, Filter, SortAsc, SortDesc
} from 'lucide-react'
import { Input } from '@/components/ui/input'

interface ApiKey {
  id: number
  name: string
  key: string
  is_active: boolean
  last_used_at: string | null
  created_at: string | null
  usage_count?: number
}

interface ApiKeyListProps {
  apiKeys: ApiKey[]
  onRefresh: () => void
  onCreate: (name: string) => Promise<void>
  onDelete: (id: number) => Promise<void>
  isLoading?: boolean
  maxKeys?: number
  currentKeys?: number
}

export function ApiKeyList({
  apiKeys,
  onRefresh,
  onCreate,
  onDelete,
  isLoading = false,
  maxKeys = 5,
  currentKeys = 0
}: ApiKeyListProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'last_used_at'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [visibleKeys, setVisibleKeys] = useState<Set<number>>(new Set())

  const canCreateMore = currentKeys < maxKeys

  const filteredAndSortedKeys = apiKeys
    .filter(key => 
      key.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
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
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  const toggleVisibility = (id: number) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
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

  const getMaskedKey = (keyHash: string | null | undefined) => {
    if (!keyHash) return '••••••••...••••'
    return `${keyHash.substring(0, 8)}...${keyHash.substring(keyHash.length - 4)}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">API Keys</h2>
          <p className="text-gray-600">
            Manage your API keys for accessing the Food Nutrition Database API
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!canCreateMore || isLoading}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Key
          </Button>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Keys</p>
                <p className="text-2xl font-bold text-gray-900">{currentKeys}</p>
              </div>
              <Key className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Keys</p>
                <p className="text-2xl font-bold text-green-600">
                  {apiKeys.filter(key => key.is_active).length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-green-600 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Remaining</p>
                <p className="text-2xl font-bold text-gray-900">
                  {maxKeys - currentKeys}
                </p>
              </div>
              <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {maxKeys}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search API keys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort('name')}
            className="flex items-center"
          >
            <Filter className="h-4 w-4 mr-1" />
            Name
            {sortBy === 'name' && (
              sortOrder === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort('created_at')}
            className="flex items-center"
          >
            <Filter className="h-4 w-4 mr-1" />
            Created
            {sortBy === 'created_at' && (
              sortOrder === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort('last_used_at')}
            className="flex items-center"
          >
            <Filter className="h-4 w-4 mr-1" />
            Last Used
            {sortBy === 'last_used_at' && (
              sortOrder === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
            )}
          </Button>
        </div>
      </div>

      {/* API Keys List */}
      {filteredAndSortedKeys.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No API keys found' : 'No API keys yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Create your first API key to start using the API'
              }
            </p>
            {!searchTerm && canCreateMore && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First API Key
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedKeys.map((apiKey) => (
            <ApiKeyCard
              key={apiKey.id}
              apiKey={apiKey}
              onDelete={onDelete}
              onToggleVisibility={toggleVisibility}
              isVisible={visibleKeys.has(apiKey.id)}
              maskedKey={getMaskedKey(apiKey.key)}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateApiKeyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={onCreate}
        isLoading={isLoading}
      />
    </div>
  )
}
