'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Loader2, Play, AlertCircle } from 'lucide-react'
import { SITE_URL } from '@/lib/site'
import {
  PLAYGROUND_ENDPOINTS,
  PUBLIC_DEMO_RATE_LIMIT,
  buildPlaygroundUrl,
  initialParamValues,
  type PlaygroundEndpoint,
} from '@/lib/playground/endpoints'
import { cn } from '@/lib/utils/cn'

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:8000'

export function ApiPlaygroundPage() {
  const [activeId, setActiveId] = useState(PLAYGROUND_ENDPOINTS[0].id)
  const [valuesByEndpoint, setValuesByEndpoint] = useState<Record<string, Record<string, string>>>(() =>
    Object.fromEntries(PLAYGROUND_ENDPOINTS.map((endpoint) => [endpoint.id, initialParamValues(endpoint)]))
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusCode, setStatusCode] = useState<number | null>(null)
  const [result, setResult] = useState('')

  const activeEndpoint = useMemo(
    () => PLAYGROUND_ENDPOINTS.find((endpoint) => endpoint.id === activeId) ?? PLAYGROUND_ENDPOINTS[0],
    [activeId]
  )

  const values = valuesByEndpoint[activeEndpoint.id] ?? initialParamValues(activeEndpoint)

  const requestUrl = useMemo(
    () => buildPlaygroundUrl(API_BASE, activeEndpoint, values),
    [activeEndpoint, values]
  )

  const setParamValue = (key: string, value: string) => {
    setValuesByEndpoint((prev) => ({
      ...prev,
      [activeEndpoint.id]: { ...prev[activeEndpoint.id], [key]: value },
    }))
  }

  const runRequest = async () => {
    setLoading(true)
    setError(null)
    setStatusCode(null)

    try {
      const res = await fetch(requestUrl)
      const text = await res.text()
      setStatusCode(res.status)

      if (!res.ok) {
        let msg = `Request failed (${res.status})`
        try {
          const parsed = JSON.parse(text)
          msg = parsed.detail || msg
        } catch {
          msg = text || msg
        }
        setError(msg)
        setResult(text ? tryFormatJson(text) : '')
        return
      }

      setResult(tryFormatJson(text))
    } catch {
      setError('Could not reach API. Check NEXT_PUBLIC_API_URL and CORS.')
      setResult('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="docs-layout bg-white -mt-1">
      <aside className="hidden lg:block w-64 shrink-0 border-r border-surface-border/80 bg-white sticky top-[var(--site-header-offset)] h-[calc(100vh-var(--site-header-offset))] overflow-y-auto">
        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-strong">Endpoints</p>
            <p className="text-sm text-ink-muted mt-1">Public demo routes (no API key)</p>
          </div>
          <EndpointNav activeId={activeId} onSelect={setActiveId} />
          <RateLimitCallout />
        </div>
      </aside>

      <main className="docs-main min-w-0">
        <div className="lg:hidden mb-6">
          <label htmlFor="playground-endpoint" className="text-sm font-medium text-ink mb-2 block">
            Endpoint
          </label>
          <select
            id="playground-endpoint"
            className="w-full h-10 rounded-brand border border-surface-border px-3 text-sm"
            value={activeId}
            onChange={(event) => setActiveId(event.target.value)}
          >
            {PLAYGROUND_ENDPOINTS.map((endpoint) => (
              <option key={endpoint.id} value={endpoint.id}>
                {endpoint.name}
              </option>
            ))}
          </select>
        </div>

        <EndpointPanel
          endpoint={activeEndpoint}
          values={values}
          onChange={setParamValue}
          requestUrl={requestUrl}
          loading={loading}
          onRun={runRequest}
          error={error}
          statusCode={statusCode}
          result={result}
        />

        <p className="text-sm text-ink-muted mt-8">
          Need higher limits and authenticated endpoints?{' '}
          <Link href="/auth/register" className="text-brand-strong hover:underline">
            Create a free account
          </Link>{' '}
          or read the{' '}
          <Link href="/docs" className="text-brand-strong hover:underline">
            full API reference
          </Link>
          .
        </p>
      </main>
    </div>
  )
}

function EndpointNav({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  return (
    <ul className="space-y-1">
      {PLAYGROUND_ENDPOINTS.map((endpoint) => (
        <li key={endpoint.id}>
          <button
            type="button"
            onClick={() => onSelect(endpoint.id)}
            className={cn(
              'w-full text-left rounded-brand px-3 py-2 text-sm transition-colors',
              activeId === endpoint.id
                ? 'bg-brand/10 text-brand-strong font-medium'
                : 'text-ink-muted hover:bg-surface-elevated hover:text-ink'
            )}
          >
            {endpoint.name}
          </button>
        </li>
      ))}
    </ul>
  )
}

function RateLimitCallout() {
  return (
    <div className="rounded-brand border border-surface-border bg-surface-elevated/60 p-4 text-sm text-ink-muted">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-brand shrink-0 mt-0.5" aria-hidden />
        <div className="space-y-2">
          <p className="font-medium text-ink">Demo rate limits</p>
          <ul className="space-y-1 list-disc pl-4">
            <li>{PUBLIC_DEMO_RATE_LIMIT.hourly} requests per hour per IP</li>
            <li>{PUBLIC_DEMO_RATE_LIMIT.minIntervalSec} second minimum between requests</li>
          </ul>
          <p>
            Production keys:{' '}
            <a href={`${SITE_URL}/auth/register`} className="text-brand-strong hover:underline">
              sign up free
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

type EndpointPanelProps = {
  endpoint: PlaygroundEndpoint
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  requestUrl: string
  loading: boolean
  onRun: () => void
  error: string | null
  statusCode: number | null
  result: string
}

function EndpointPanel({
  endpoint,
  values,
  onChange,
  requestUrl,
  loading,
  onRun,
  error,
  statusCode,
  result,
}: EndpointPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-strong mb-2">Playground</p>
        <h2 className="text-2xl font-bold text-ink">{endpoint.name}</h2>
        <p className="text-ink-muted mt-2 max-w-2xl">{endpoint.description}</p>
      </div>

      <div className="glass-panel overflow-hidden shadow-glass-lg">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-surface-border/80 bg-surface-elevated">
          <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            {endpoint.method}
          </span>
          <span className="text-xs text-ink-dim font-mono truncate">{requestUrl.replace(API_BASE, '')}</span>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {endpoint.params.map((param) => (
              <label key={param.key} className="block text-sm">
                <span className="font-medium text-ink mb-1.5 block">
                  {param.label}
                  {param.required ? ' *' : ''}
                </span>
                <input
                  type={param.type === 'number' ? 'number' : 'text'}
                  className="w-full h-10 rounded-brand border border-surface-border px-3 text-ink placeholder:text-ink-dim focus:outline-none focus:ring-2 focus:ring-brand/30"
                  value={values[param.key] ?? ''}
                  placeholder={param.placeholder}
                  onChange={(event) => onChange(param.key, event.target.value)}
                />
              </label>
            ))}
          </div>

          <button type="button" className="btn-brand inline-flex items-center gap-2" onClick={onRun} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Send request
          </button>

          {error && <p className="text-sm text-error-500">{error}</p>}

          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-sm font-medium text-ink">Response</p>
              {statusCode !== null && (
                <span
                  className={cn(
                    'text-xs font-mono px-2 py-0.5 rounded',
                    statusCode >= 200 && statusCode < 300
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-700'
                  )}
                >
                  HTTP {statusCode}
                </span>
              )}
            </div>
            <pre className="marketing-code-window-body max-h-[28rem] m-0 rounded-brand border border-surface-border bg-[#0f172a] text-slate-300 max-w-full overflow-auto whitespace-pre">
              {result || `GET ${requestUrl}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

function tryFormatJson(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2)
  } catch {
    return text
  }
}
