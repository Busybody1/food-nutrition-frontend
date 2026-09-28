'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function McpEndpointBar({ endpoint }: { endpoint: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(endpoint)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="mx-auto mt-6 flex max-w-xl items-center gap-2 rounded-brand border border-surface-border bg-white p-2 text-left shadow-glass">
      <code className="min-w-0 flex-1 truncate px-2 font-mono text-sm text-ink">{endpoint}</code>
      <button type="button" className="btn-brand h-10 shrink-0 px-4" onClick={() => void copy()}>
        {copied ? <Check className="mr-2 h-4 w-4" aria-hidden /> : <Copy className="mr-2 h-4 w-4" aria-hidden />}
        {copied ? 'Copied' : 'Copy URL'}
      </button>
    </div>
  )
}
