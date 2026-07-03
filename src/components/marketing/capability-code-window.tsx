'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

/**
 * Marketing-surface code sample for capability pages: `marketing-code-window`
 * chrome (window dots + title + copy button) instead of the docs-surface
 * `docs-code-panel` language. Title and code render byte-identical to the
 * page data — this component only changes the frame.
 */
export function CapabilityCodeWindow({ title, code }: { title: string; code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="marketing-code-window">
      <div className="marketing-code-window-header gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex shrink-0 items-center gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span className="min-w-0 break-all font-mono text-xs leading-snug text-slate-300">
            {title}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code"
          className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-slate-300 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1e293b]"
        >
          {copied ? (
            <Check className="h-4 w-4" aria-hidden />
          ) : (
            <Copy className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>
      <pre className="marketing-code-window-body m-0 whitespace-pre-wrap break-words leading-relaxed sm:whitespace-pre sm:break-normal sm:text-sm">
        {code}
      </pre>
    </div>
  )
}
