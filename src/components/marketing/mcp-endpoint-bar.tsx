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
    <div className="mx-auto mt-6 flex max-w-xl items-center gap-2 rounded-full border border-mk-line bg-mk-stage p-1.5 pl-2 text-left">
      <code className="min-w-0 flex-1 truncate px-2 font-mono text-sm text-mk-ink">{endpoint}</code>
      <button type="button" className="btn-brand shrink-0" onClick={() => void copy()}>
        {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
        {copied ? 'Copied' : 'Copy URL'}
      </button>
    </div>
  )
}
