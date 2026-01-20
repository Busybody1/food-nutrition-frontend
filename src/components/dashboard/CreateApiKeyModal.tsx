'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Key, X, AlertCircle } from 'lucide-react'

interface CreateApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string) => Promise<void>
  isLoading?: boolean
}

export function CreateApiKeyModal({ 
  isOpen, 
  onClose, 
  onCreate, 
  isLoading = false 
}: CreateApiKeyModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      setError('API key name is required')
      return
    }

    if (name.length > 100) {
      setError('API key name must be less than 100 characters')
      return
    }

    try {
      await onCreate(name.trim())
      setName('')
      setError('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key')
    }
  }

  const handleClose = () => {
    setName('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Key className="h-5 w-5 mr-2 text-blue-600" />
            Create New API Key
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="key-name" className="text-sm font-medium text-gray-700 mb-2 block">
                API Key Name
              </label>
              <Input
                id="key-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError('')
                }}
                placeholder="e.g., Mobile App, Web Dashboard, Production"
                className="w-full"
                maxLength={100}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Choose a descriptive name to help you identify this key later
              </p>
            </div>

            {error && (
              <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Important Security Notes:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Store your API key securely</li>
                    <li>Don&apos;t share it publicly or commit to version control</li>
                    <li>You can regenerate it anytime if compromised</li>
                    <li>Each key has its own usage tracking</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading || !name.trim()}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    Create API Key
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
