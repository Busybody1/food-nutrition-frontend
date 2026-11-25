import { Camera } from 'lucide-react'
import type { PhotoTestUsage } from '@/types/api'
import { photoTestSentence } from '@/lib/dashboard/photo-test'
import { DASHBOARD_ICON_STROKE } from '@/components/dashboard/dashboard-shell'
import { cn } from '@/lib/utils/cn'

export function PhotoTestLine({
  photoTest,
  className,
}: {
  photoTest?: PhotoTestUsage | null
  className?: string
}) {
  const sentence = photoTestSentence(photoTest)
  if (!sentence) return null
  return (
    <p className={cn('flex items-center gap-2 text-[13px] text-dash-body tabular-nums', className)}>
      <Camera className="h-4 w-4 shrink-0 text-dash-muted" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
      <span>{sentence}</span>
    </p>
  )
}
