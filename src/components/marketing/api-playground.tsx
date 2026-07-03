'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { JsonSyntax } from '@/components/playground/json-syntax';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:8000';

const INLINE_LINK_CLASS =
  'font-medium text-brand-strong underline decoration-brand/40 underline-offset-2 hover:decoration-brand-strong rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2';

export function ApiPlayground() {
  const [query, setQuery] = useState('apple');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');

  const runDemo = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/public/search/foods?q=${encodeURIComponent(query)}&limit=3`
      );
      const text = await res.text();
      if (!res.ok) {
        let msg = 'Request failed';
        try {
          const j = JSON.parse(text);
          msg = j.detail || msg;
        } catch {
          msg = text || msg;
        }
        setError(msg);
        setResult('');
        return;
      }
      setResult(JSON.stringify(JSON.parse(text), null, 2));
    } catch {
      setError('Could not reach API. Check NEXT_PUBLIC_API_URL and CORS.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel overflow-hidden max-w-3xl mx-auto w-full min-w-0 shadow-glass-lg">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-surface-border/80 bg-surface-elevated">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400/90" aria-hidden />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400/90" aria-hidden />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/90" aria-hidden />
        <span className="ml-2 text-xs text-ink-muted font-mono">Public demo</span>
      </div>
      <div className="p-6 space-y-4">
        <form
          className="flex flex-col sm:flex-row gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            runDemo();
          }}
        >
          <input
            className="flex-1 bg-white border border-surface-border rounded-brand px-4 py-2.5 text-sm text-ink placeholder:text-ink-dim focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40 transition-colors"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search foods…"
            aria-label="Food search query"
          />
          <button type="submit" className="btn-brand shrink-0 min-w-[108px] gap-2 disabled:opacity-60 disabled:pointer-events-none" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            Try API
          </button>
        </form>
        {error && (
          <p role="alert" className="text-sm text-error-600">
            {error}
          </p>
        )}
        <pre
          key={result ? `result-${result.length}` : 'idle'}
          aria-live="polite"
          aria-busy={loading}
          className="marketing-code-window-body max-h-64 m-0 rounded-brand border border-surface-border bg-[#0f172a] text-slate-300 max-w-full overflow-x-auto whitespace-pre motion-safe:animate-[fade-rise_0.3s_ease-out]"
        >
          <JsonSyntax code={result || `GET ${API_BASE}/api/v1/public/search/foods?q=${query}&limit=3`} />
        </pre>
        <p className="text-sm text-ink-muted">
          Try search, suggest, barcode, and food details in the{' '}
          <Link href="/playground" className={INLINE_LINK_CLASS}>
            full API playground
          </Link>
          . Production keys:{' '}
          <Link href="/auth/register" className={INLINE_LINK_CLASS}>
            create a free account
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
