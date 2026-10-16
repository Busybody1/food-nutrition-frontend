'use client'

import {
  AreaTrendChart,
  BarTrendChart,
  DonutChart,
  CHART_SERIES,
  formatFull,
} from '@/components/dashboard/dashboard-charts'

export {
  AreaTrendChart,
  BarTrendChart,
  DonutChart,
  ChartLegend,
  ChartTooltipCard,
  CHART_SERIES,
  formatCompact,
  formatFull,
  formatShortDate,
  foldDonutData,
} from '@/components/dashboard/dashboard-charts'

function paletteColor(color: string | undefined, index = 0): string {
  const allowed = CHART_SERIES as readonly string[]
  if (color && allowed.includes(color.toUpperCase())) return color.toUpperCase()
  return CHART_SERIES[index % CHART_SERIES.length]
}

export function AdminLineChart({
  data,
  xKey,
  yKey,
  height = 240,
  color,
  name,
  valueFormatter = formatFull,
}: {
  data: Array<Record<string, unknown>>
  xKey: string
  yKey: string
  height?: number
  color?: string
  name?: string
  valueFormatter?: (value: unknown, name: string) => string
}) {
  return (
    <AreaTrendChart
      data={data}
      xKey={xKey}
      height={height}
      valueFormatter={valueFormatter}
      series={[{ key: yKey, name: name ?? yKey.replace(/_/g, ' '), color: paletteColor(color) }]}
    />
  )
}

export function AdminBarChart({
  data,
  xKey,
  yKey,
  height = 240,
  name,
}: {
  data: Array<Record<string, unknown>>
  xKey: string
  yKey: string
  height?: number
  name?: string
}) {
  return (
    <BarTrendChart
      data={data}
      xKey={xKey}
      yKey={yKey}
      height={height}
      name={name ?? yKey.replace(/_/g, ' ')}
    />
  )
}

export function AdminPieChart({
  data,
  nameKey,
  valueKey,
  height = 150,
  centerLabel,
}: {
  data: Array<Record<string, unknown>>
  nameKey: string
  valueKey: string
  height?: number
  centerLabel?: string
}) {
  const slices = data.map((d) => ({
    name: String(d[nameKey] ?? ''),
    value: Number(d[valueKey]) || 0,
  }))
  return <DonutChart data={slices} height={height} centerLabel={centerLabel} />
}

export function AdminDualLineChart({
  data,
  xKey,
  lines,
  height = 260,
}: {
  data: Array<Record<string, unknown>>
  xKey: string
  lines: { key: string; color?: string; name: string }[]
  height?: number
}) {
  return (
    <AreaTrendChart
      data={data}
      xKey={xKey}
      height={height}
      series={lines.map((line, index) => ({
        key: line.key,
        name: line.name,
        color: paletteColor(line.color, index),
      }))}
    />
  )
}
