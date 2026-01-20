'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Key, Copy, Eye, EyeOff, Trash2, 
  Calendar, Activity, AlertCircle, CheckCircle
} from 'lucide-react'

interface ApiKey {
  id: number
  name: string
  key: string
  is_active: boolean
  last_used_at: string | null
  created_at: string | null
  usage_count?: number
}

interface ApiKeyCardProps {
  apiKey: ApiKey
  onDelete: (id: number) => void
  onToggleVisibility: (id: number) => void
  isVisible: boolean
  maskedKey: string
}

export function ApiKeyCard({ 
  apiKey, 
  onDelete, 
  onToggleVisibility, 
  isVisible,
  maskedKey 
}: ApiKeyCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      const keyToCopy = apiKey.key || '••••••••...••••'
      await navigator.clipboard.writeText(keyToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never used'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = () => {
    if (!apiKey.is_active) return 'bg-gray-100 text-gray-800'
    if (apiKey.last_used_at) return 'bg-green-100 text-green-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  const getStatusText = () => {
    if (!apiKey.is_active) return 'Inactive'
    if (apiKey.last_used_at) return 'Active'
    return 'Created'
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Key className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{apiKey.name}</h3>
              <p className="text-sm text-gray-500">
                Created {apiKey.created_at ? new Date(apiKey.created_at).toLocaleDateString() : 'Recently'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor()}>
              {getStatusText()}
            </Badge>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleVisibility(apiKey.id)}
                className="h-8 w-8 p-0"
                title={isVisible ? "Hide API key" : "Show API key"}
              >
                {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(apiKey.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Delete API key"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* API Key Display */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              API Key
            </label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 px-3 py-2 bg-gray-100 rounded-md font-mono text-sm">
                {isVisible ? (apiKey.key || '••••••••...••••') : maskedKey}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Copied to clipboard
              </p>
            )}
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Last Used</p>
                <p className="text-sm font-medium">
                  {formatDate(apiKey.last_used_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Usage Count</p>
                <p className="text-sm font-medium">
                  {apiKey.usage_count || 0} requests
                </p>
              </div>
            </div>
          </div>

          {/* Security Warning */}
          {isVisible && (
            <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Keep your API key secure</p>
                <p>Don&apos;t share it publicly or commit it to version control.</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
