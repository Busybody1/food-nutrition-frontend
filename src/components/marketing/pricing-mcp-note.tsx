import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function PricingMcpExclusionNote({ className }: { className?: string }) {
  return (
    <p className={cn('flex items-start gap-2 text-xs leading-snug text-ink-dim', className)}>
      <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>
        MCP server access is not included in this plan.{' '}
        <Link
          href="/mcp/pricing"
          className="font-medium text-brand-strong underline underline-offset-2"
        >
          See the MCP plan
        </Link>
        .
      </span>
    </p>
  )
}
