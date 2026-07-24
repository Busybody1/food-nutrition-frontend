'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Loader2, Play, AlertCircle } from 'lucide-react'
import {
  PLAYGROUND_ENDPOINTS,
  PUBLIC_DEMO_RATE_LIMIT,
  buildPlaygroundUrl,
  initialParamValues,
  initialBody,
  type PlaygroundEndpoint,
} from '@/lib/playground/endpoints'
import { JsonSyntax } from '@/components/playground/json-syntax'
import { cn } from '@/lib/utils/cn'

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:8000'

const INLINE_LINK_CLASS =
  'text-brand-strong underline decoration-brand/40 underline-offset-2 hover:decoration-brand-strong rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2'

export function ApiPlaygroundPage() {
  const [activeId, setActiveId] = useState(PLAYGROUND_ENDPOINTS[0].id)
  const [valuesByEndpoint, setValuesByEndpoint] = useState<Record<string, Record<string, string>>>(() =>
    Object.fromEntries(PLAYGROUND_ENDPOINTS.map((endpoint) => [endpoint.id, initialParamValues(endpoint)]))
  )
  const [bodyByEndpoint, setBodyByEndpoint] = useState<Record<string, string>>(() =>
    Object.fromEntries(PLAYGROUND_ENDPOINTS.map((endpoint) => [endpoint.id, initialBody(endpoint)]))
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
  const body = bodyByEndpoint[activeEndpoint.id] ?? initialBody(activeEndpoint)

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

  const setBody = (value: string) => {
    setBodyByEndpoint((prev) => ({ ...prev, [activeEndpoint.id]: value }))
  }

  const runRequest = async () => {
    setLoading(true)
    setError(null)
    setStatusCode(null)

    try {
      const isPost = activeEndpoint.method === 'POST'

      if (isPost) {
        try {
          JSON.parse(body)
        } catch {
          setError('Invalid JSON body. Fix the syntax and try again.')
          setLoading(false)
          return
        }
      }

      const res = await fetch(requestUrl, {
        method: activeEndpoint.method,
        ...(isPost && { headers: { 'Content-Type': 'application/json' }, body }),
      })
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
    <div className="docs-layout bg-white">
      <aside className="hidden lg:block w-64 shrink-0 border-r border-surface-border/80 bg-white sticky top-[var(--site-header-offset)] h-[calc(100vh-var(--site-header-offset))] overflow-y-auto">
        <div className="px-5 pb-6 pt-10 space-y-4">
          <div>
            <p className="marketing-section-label">Endpoints</p>
            <p className="text-sm text-ink-muted mt-1">Public demo routes (no API key)</p>
          </div>
          <EndpointNav activeId={activeId} onSelect={setActiveId} />
          <RateLimitCallout />
        </div>
      </aside>

      <main className="docs-main min-w-0 pt-6 sm:pt-8 lg:pt-10 pb-16 lg:pb-20">
        <div className="lg:hidden mb-6 max-w-4xl">
          <label htmlFor="playground-endpoint" className="text-sm font-medium text-ink mb-2 block">
            Endpoint
          </label>
          <select
            id="playground-endpoint"
            className="w-full h-10 rounded-brand border border-surface-border bg-white px-3 text-sm text-ink cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40"
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
          key={activeEndpoint.id}
          endpoint={activeEndpoint}
          values={values}
          onChange={setParamValue}
          body={body}
          onBodyChange={setBody}
          requestUrl={requestUrl}
          loading={loading}
          onRun={runRequest}
          error={error}
          statusCode={statusCode}
          result={result}
        />

        {/* Mobile/tablet never see the sidebar — repeat the demo limits so 429s aren't a surprise. */}
        <RateLimitCallout className="lg:hidden mt-8 max-w-4xl" />

        <div className="marketing-callout mt-10 max-w-4xl">
          <p className="text-sm text-ink-muted leading-relaxed">
            Need higher limits and authenticated endpoints?{' '}
            <Link href="/auth/register" className={cn(INLINE_LINK_CLASS, 'font-medium')}>
              Create a free account
            </Link>{' '}
            or read the{' '}
            <Link href="/docs" className={cn(INLINE_LINK_CLASS, 'font-medium')}>
              full API reference
            </Link>
            .
          </p>
        </div>
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
            aria-current={activeId === endpoint.id ? 'true' : undefined}
            className={cn(
              'w-full text-left rounded-brand px-3 py-2 text-sm transition-colors duration-150 cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-1',
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

function RateLimitCallout({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-brand border border-surface-border bg-surface-elevated/60 p-4 text-sm text-ink-muted', className)}>
      <div className="flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-brand-strong shrink-0 mt-0.5" aria-hidden />
        <div className="space-y-2">
          <p className="font-medium text-ink">Demo rate limits</p>
          <ul className="space-y-1 list-disc pl-4">
            <li>{PUBLIC_DEMO_RATE_LIMIT.hourly} requests per hour per IP</li>
            <li>{PUBLIC_DEMO_RATE_LIMIT.minIntervalSec} second minimum between requests</li>
          </ul>
          <p>
            Production keys:{' '}
            <Link href="/auth/register" className={INLINE_LINK_CLASS}>
              sign up free
            </Link>
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
  body: string
  onBodyChange: (value: string) => void
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
  body,
  onBodyChange,
  requestUrl,
  loading,
  onRun,
  error,
  statusCode,
  result,
}: EndpointPanelProps) {
  const isPost = endpoint.method === 'POST'
  const methodColors = isPost
    ? 'text-brand-strong bg-brand-muted'
    : 'text-emerald-700 bg-emerald-50'

  return (
    <div className="space-y-6 max-w-4xl motion-safe:animate-[fade-rise_0.3s_ease-out]">
      <div>
        <p className="marketing-section-label mb-2">Playground</p>
        <h2 className="font-display text-2xl md:text-3xl text-ink tracking-tight">{endpoint.name}</h2>
        <p className="text-ink-muted leading-relaxed mt-2 max-w-2xl">{endpoint.description}</p>
      </div>

      <div className="glass-panel overflow-hidden shadow-glass-lg">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-surface-border/80 bg-surface-elevated">
          <span className="flex items-center gap-1.5 mr-1" aria-hidden>
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/90" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/90" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/90" />
          </span>
          <span className={cn('text-xs font-mono font-semibold px-2 py-0.5 rounded', methodColors)}>
            {endpoint.method}
          </span>
          <span className="text-xs text-ink-muted font-mono truncate">{requestUrl.replace(API_BASE, '')}</span>
        </div>

        <form
          className="p-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            onRun()
          }}
        >
          {isPost ? (
            <label className="block text-sm">
              <span className="font-medium text-ink mb-1.5 block">Request body (JSON)</span>
              <textarea
                className="w-full rounded-brand border border-surface-border px-3 py-2 text-sm font-mono text-ink placeholder:text-ink-dim focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40 transition-colors resize-y"
                rows={10}
                value={body}
                onChange={(event) => onBodyChange(event.target.value)}
                spellCheck={false}
              />
            </label>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {endpoint.params.map((param) =>
                param.type === 'select' ? (
                  <label key={param.key} className="block text-sm">
                    <span className="font-medium text-ink mb-1.5 block">
                      {param.label}
                      {param.required ? ' *' : ''}
                    </span>
                    <select
                      className="w-full h-10 rounded-brand border border-surface-border px-3 text-ink bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40 transition-colors"
                      value={values[param.key] ?? ''}
                      required={param.required}
                      aria-required={param.required || undefined}
                      onChange={(event) => onChange(param.key, event.target.value)}
                    >
                      {param.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label key={param.key} className="block text-sm">
                    <span className="font-medium text-ink mb-1.5 block">
                      {param.label}
                      {param.required ? ' *' : ''}
                    </span>
                    <input
                      type={param.type === 'number' ? 'number' : 'text'}
                      className="w-full h-10 rounded-brand border border-surface-border px-3 text-ink placeholder:text-ink-dim focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40 transition-colors"
                      value={values[param.key] ?? ''}
                      placeholder={param.placeholder}
                      required={param.required}
                      aria-required={param.required || undefined}
                      min={param.type === 'number' ? param.min : undefined}
                      max={param.type === 'number' ? param.max : undefined}
                      onChange={(event) => onChange(param.key, event.target.value)}
                    />
                  </label>
                )
              )}
            </div>
          )}

          <button
            type="submit"
            className="btn-brand inline-flex items-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Send request
          </button>

          {error && (
            <p role="alert" className="text-sm text-error-500">
              {error}
            </p>
          )}

          <div>
            <div className="flex items-center justify-between gap-3 mb-2" role="status" aria-live="polite">
              <p className="text-sm font-medium text-ink">Response</p>
              {statusCode !== null && (
                <span
                  className={cn(
                    'text-xs font-mono px-2 py-0.5 rounded',
                    statusCode >= 200 && statusCode < 300
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-error-500/10 text-error-500'
                  )}
                >
                  HTTP {statusCode}
                </span>
              )}
            </div>
            <pre
              key={result ? `result-${result.length}` : 'idle'}
              className="marketing-code-window-body max-h-[28rem] m-0 rounded-brand border border-surface-border bg-[#0f172a] text-slate-300 max-w-full overflow-auto whitespace-pre motion-safe:animate-[fade-rise_0.3s_ease-out]"
            >
              <JsonSyntax code={result || `${endpoint.method} ${requestUrl}`} />
            </pre>
          </div>
        </form>
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
