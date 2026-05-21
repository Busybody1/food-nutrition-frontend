'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Key, X, AlertCircle, Copy, CheckCircle } from 'lucide-react'
import type { CreatedApiKeyResult } from '@/lib/api/api-keys'

interface CreateApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string) => Promise<CreatedApiKeyResult | void>
  isLoading?: boolean
}

export function CreateApiKeyModal({
  isOpen,
  onClose,
  onCreate,
  isLoading = false,
}: CreateApiKeyModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [created, setCreated] = useState<CreatedApiKeyResult | null>(null)
  const [copied, setCopied] = useState(false)

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
      const result = await onCreate(name.trim())
      if (result?.key) {
        setCreated(result)
        setName('')
        setError('')
      } else {
        handleClose()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key')
    }
  }

  const handleCopy = async () => {
    if (!created?.key) return
    try {
      await navigator.clipboard.writeText(created.key)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy to clipboard. Select the key below and copy manually.')
    }
  }

  const handleClose = () => {
    setName('')
    setError('')
    setCreated(null)
    setCopied(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/25 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-glass-lg border-surface-border/80 animate-slide-up">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Key className="h-5 w-5 mr-2 text-blue-600" />
            {created ? 'Save your API key' : 'Create New API Key'}
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
          {created ? (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-900">
                <p className="font-medium">Copy this key now</p>
                <p className="mt-1 text-xs">
                  You won&apos;t be able to see the full key again after closing this dialog.
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">{created.name}</p>
                <div className="flex items-start gap-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 rounded-md font-mono text-xs break-all">
                    {created.key}
                  </code>
                  <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {copied && (
                  <p className="text-xs text-green-600 mt-1">Copied to clipboard</p>
                )}
              </div>

              <Button type="button" className="w-full" onClick={handleClose}>
                I&apos;ve saved my key
              </Button>
            </div>
          ) : (
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
                      <li>The full key is shown only once after creation</li>
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
