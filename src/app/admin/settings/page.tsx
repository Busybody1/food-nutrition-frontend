'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, Save, RefreshCw, AlertCircle, 
  ToggleLeft, Hash, Type, Code
} from 'lucide-react'
import { apiClient } from '@/lib/api/client'

interface SystemSetting {
  setting_key: string
  setting_value: string
  setting_type: 'string' | 'number' | 'boolean' | 'json'
  description: string
  is_public: boolean
  updated_at: string
}

interface SettingUpdateResponse {
  updated_at: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [saving, setSaving] = useState<string | null>(null)

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await apiClient.get<SystemSetting[]>('/api/v1/admin/settings')
      setSettings(response.data)
    } catch (error) {
      console.error('Failed to load settings:', error)
      setError(error instanceof Error ? error.message : 'Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleEdit = (setting: SystemSetting) => {
    setEditingKey(setting.setting_key)
    setEditValue(setting.setting_value)
  }

  const handleSave = async (settingKey: string) => {
    try {
      setSaving(settingKey)
      
      const response = await apiClient.put(`/api/v1/admin/settings/${settingKey}`, {
        setting_value: editValue
      })
      
      // Update the settings list
      setSettings(prev => prev.map(s => 
        s.setting_key === settingKey 
          ? { ...s, setting_value: editValue, updated_at: (response.data as SettingUpdateResponse).updated_at }
          : s
      ))
      
      setEditingKey(null)
      setEditValue('')
    } catch (error) {
      console.error('Failed to save setting:', error)
      setError(error instanceof Error ? error.message : 'Failed to save setting')
    } finally {
      setSaving(null)
    }
  }

  const handleCancel = () => {
    setEditingKey(null)
    setEditValue('')
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'boolean':
        return <ToggleLeft className="w-4 h-4" />
      case 'number':
        return <Hash className="w-4 h-4" />
      case 'json':
        return <Code className="w-4 h-4" />
      default:
        return <Type className="w-4 h-4" />
    }
  }

  const renderSettingValue = (setting: SystemSetting) => {
    if (editingKey === setting.setting_key) {
      if (setting.setting_type === 'boolean') {
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={editValue === 'true'}
              onCheckedChange={(checked) => setEditValue(checked ? 'true' : 'false')}
            />
            <span className="text-sm text-gray-600">
              {editValue === 'true' ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        )
      } else if (setting.setting_type === 'json') {
        return (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-h-[100px] font-mono text-sm"
            placeholder="Enter JSON value..."
          />
        )
      } else {
        return (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            type={setting.setting_type === 'number' ? 'number' : 'text'}
            placeholder={`Enter ${setting.setting_type} value...`}
          />
        )
      }
    }

    // Display current value
    if (setting.setting_type === 'boolean') {
      return (
        <div className="flex items-center space-x-2">
          <Badge variant={setting.setting_value === 'true' ? 'default' : 'secondary'}>
            {setting.setting_value === 'true' ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
      )
    } else if (setting.setting_type === 'json') {
      try {
        const parsed = JSON.parse(setting.setting_value)
        return (
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
            {JSON.stringify(parsed, null, 2)}
          </pre>
        )
      } catch {
        return <span className="text-red-600 text-sm">Invalid JSON</span>
      }
    } else {
      return <span className="font-mono text-sm">{setting.setting_value}</span>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-600 mb-2">Error loading settings</div>
          <div className="text-sm text-gray-600 mb-4">{error}</div>
          <Button onClick={loadSettings} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage system configuration and feature flags
          </p>
        </div>
        <Button onClick={loadSettings} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Settings List */}
      <div className="space-y-4">
        {settings.map((setting) => (
          <Card key={setting.setting_key}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getTypeIcon(setting.setting_type)}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {setting.setting_key}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {setting.setting_type}
                    </Badge>
                    {setting.is_public && (
                      <Badge variant="secondary" className="text-xs">
                        Public
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {setting.description}
                  </p>
                  
                  <div className="mb-4">
                    <Label className="text-sm font-medium text-gray-700">
                      Current Value:
                    </Label>
                    <div className="mt-1">
                      {renderSettingValue(setting)}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Last updated: {new Date(setting.updated_at).toLocaleString()}
                  </div>
                </div>
                
                <div className="ml-4 flex space-x-2">
                  {editingKey === setting.setting_key ? (
                    <>
                      <Button
                        onClick={() => handleSave(setting.setting_key)}
                        disabled={saving === setting.setting_key}
                        size="sm"
                      >
                        {saving === setting.setting_key ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleEdit(setting)}
                      variant="outline"
                      size="sm"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {settings.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Settings Found</h3>
            <p className="text-gray-600">
              System settings will appear here once they are configured.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}