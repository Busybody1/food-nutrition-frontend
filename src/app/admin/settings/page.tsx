'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Settings, Save, RefreshCw, Pencil,
  ToggleLeft, Hash, Type, Code, Wrench
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import { adminAPI } from '@/lib/api/admin'
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
  AdminRefreshButton,
  DashboardLoading,
  DashboardAlert,
  DashboardEmpty,
  DashboardPanelHeader,
  DashboardPill,
  DASHBOARD_ICON_STROKE,
} from '@/components/admin/admin-ui'

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

const SETTING_GROUPS: {
  id: string
  title: string
  icon: LucideIcon
  matches: (type: string) => boolean
}[] = [
  { id: 'boolean', title: 'Feature flags', icon: ToggleLeft, matches: (type) => type === 'boolean' },
  { id: 'number', title: 'Numeric settings', icon: Hash, matches: (type) => type === 'number' },
  {
    id: 'string',
    title: 'Text settings',
    icon: Type,
    matches: (type) => type !== 'boolean' && type !== 'number' && type !== 'json',
  },
  { id: 'json', title: 'JSON settings', icon: Code, matches: (type) => type === 'json' },
]

function StatePill({ on }: { on: boolean }) {
  return (
    <DashboardPill tone={on ? 'green' : 'neutral'}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {on ? 'Enabled' : 'Disabled'}
    </DashboardPill>
  )
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
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
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

  const renderSettingValue = (setting: SystemSetting) => {
    if (editingKey === setting.setting_key) {
      if (setting.setting_type === 'boolean') {
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={editValue === 'true'}
              onCheckedChange={(checked) => setEditValue(checked ? 'true' : 'false')}
              aria-label={setting.setting_key}
            />
            <span className="text-xs text-dash-muted">
              {editValue === 'true' ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        )
      } else if (setting.setting_type === 'json') {
        return (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-h-[100px] font-mono text-xs"
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
            className="w-full sm:w-64"
          />
        )
      }
    }

    if (setting.setting_type === 'boolean') {
      return <StatePill on={setting.setting_value === 'true'} />
    } else if (setting.setting_type === 'json') {
      try {
        const parsed = JSON.parse(setting.setting_value)
        return (
          <pre className="dashboard-code-block block max-h-32 overflow-auto whitespace-pre">
            {JSON.stringify(parsed, null, 2)}
          </pre>
        )
      } catch {
        return <span className="text-[13px] text-dash-negative">Invalid JSON</span>
      }
    } else {
      return (
        <span className="inline-block break-all rounded-md bg-dash-hover px-2 py-1 font-mono text-[13px] text-dash-ink">
          {setting.setting_value}
        </span>
      )
    }
  }

  const renderActions = (setting: SystemSetting) =>
    editingKey === setting.setting_key ? (
      <>
        <Button
          onClick={() => handleSave(setting.setting_key)}
          disabled={saving === setting.setting_key}
          size="sm"
          className="h-8 gap-1.5"
        >
          {saving === setting.setting_key ? (
            <RefreshCw className="h-4 w-4 animate-spin" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
          ) : (
            <Save className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
          )}
          Save
        </Button>
        <Button
          onClick={handleCancel}
          variant="outline"
          size="sm"
          className="h-8"
        >
          Cancel
        </Button>
      </>
    ) : (
      <Button
        onClick={() => handleEdit(setting)}
        variant="outline"
        size="sm"
        className="h-8 gap-1.5"
      >
        <Pencil className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
        Edit
      </Button>
    )

  if (isLoading) {
    return (
      <AdminPage>
        <DashboardLoading message="Loading settings…" />
      </AdminPage>
    )
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Settings"
        description="Feature flags, rate limits, and maintenance mode."
        meta={
          <span className="dashboard-meta-pill tabular-nums">
            {settings.length} {settings.length === 1 ? 'setting' : 'settings'}
          </span>
        }
        actions={<AdminRefreshButton onClick={loadSettings} />}
      />

      {error && (
        <DashboardAlert variant="error">
          {error}
          <Button variant="outline" size="sm" className="ml-auto h-8" onClick={loadSettings}>
            Retry
          </Button>
        </DashboardAlert>
      )}

      {settings.find((s) => s.setting_key === 'maintenance_mode') && (
        <AdminPanel>
          <DashboardPanelHeader
            className="pb-4"
            title="Maintenance mode"
            icon={Wrench}
            description="When enabled, non-admin API traffic receives 503. Admin routes stay available."
            actions={
              <>
                {settings.find((s) => s.setting_key === 'maintenance_mode')?.setting_value === 'true' && (
                  <DashboardPill tone="orange">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
                    On
                  </DashboardPill>
                )}
                <Switch
                  aria-label="Maintenance mode"
                  checked={
                    settings.find((s) => s.setting_key === 'maintenance_mode')?.setting_value === 'true'
                  }
                  onCheckedChange={async (checked) => {
                    await adminAPI.updateSystemSetting('maintenance_mode', checked ? 'true' : 'false')
                    await loadSettings()
                  }}
                />
              </>
            }
          />
        </AdminPanel>
      )}

      {SETTING_GROUPS.map((group) => {
        const rows = settings.filter((setting) => group.matches(setting.setting_type))
        if (rows.length === 0) return null
        return (
          <AdminPanel key={group.id}>
            <AdminPanelHeader
              title={group.title}
              icon={group.icon}
              description={`${rows.length} ${rows.length === 1 ? 'setting' : 'settings'}`}
            />
            <div className="mt-3 divide-y divide-dash-border border-t border-dash-border">
              {rows.map((setting) => {
                const stacked = setting.setting_type === 'json'
                return (
                  <div
                    key={setting.setting_key}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="break-all font-mono text-[13px] font-medium text-dash-ink">
                          {setting.setting_key}
                        </h3>
                        <DashboardPill tone="outline">{setting.setting_type}</DashboardPill>
                        {setting.is_public && <DashboardPill tone="indigo">Public</DashboardPill>}
                      </div>
                      <p className="mt-1 text-xs leading-5 text-dash-muted">{setting.description}</p>
                      <p className="mt-0.5 text-xs text-dash-dim">
                        Last updated: {new Date(setting.updated_at).toLocaleString()}
                      </p>
                      {stacked && (
                        <div className="mt-3">
                          <span className="sr-only">Current Value:</span>
                          {renderSettingValue(setting)}
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-wrap items-center gap-2 sm:max-w-[50%] sm:shrink-0 sm:justify-end">
                      {!stacked && (
                        <div className="min-w-0">
                          <span className="sr-only">Current Value:</span>
                          {renderSettingValue(setting)}
                        </div>
                      )}
                      {renderActions(setting)}
                    </div>
                  </div>
                )
              })}
            </div>
          </AdminPanel>
        )
      })}

      {settings.length === 0 && (
        <AdminPanel>
          <DashboardEmpty
            icon={Settings}
            title="No Settings Found"
            description="System settings will appear here once they are configured."
          />
        </AdminPanel>
      )}
    </AdminPage>
  )
}
