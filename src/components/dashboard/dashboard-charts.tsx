'use client'

import { useId } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { cn } from '@/lib/utils/cn'

export const CHART_SERIES = ['#0AC5D7', '#4F46E5', '#7C6CF0', '#8B7CF6', '#C4B5FD'] as const
export const CHART_GRID = '#EEF1F6'
export const CHART_AXIS = '#8A93A3'
export const CHART_INK = '#101828'
export const CHART_MUTED_BAR = '#E6EAF0'
export const CHART_CURSOR = '#D0D5DD'
export const CHART_MAX_SERIES = 5

const AXIS_TICK = { fontSize: 11, fill: CHART_AXIS }

const TOOLTIP_PROPS = {
  allowEscapeViewBox: { x: true, y: true } as const,
  wrapperStyle: { zIndex: 30, outline: 'none' },
}

const compactFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function formatCompact(value: unknown): string {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? compactFormatter.format(n) : ''
}

export function formatFull(value: unknown): string {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n.toLocaleString() : String(value ?? '')
}

export function formatShortDate(value: unknown): string {
  const d = new Date(String(value))
  if (Number.isNaN(d.getTime())) return String(value ?? '')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export interface ChartSeries {
  key: string
  name: string
  color?: string
}

type TooltipEntry = {
  name?: string | number
  value?: unknown
  color?: string
  stroke?: string
  fill?: string
  dataKey?: unknown
  payload?: Record<string, unknown>
}

export function ChartTooltipCard({
  active,
  payload,
  label,
  valueFormatter = formatFull,
  labelFormatter,
}: {
  active?: boolean
  payload?: ReadonlyArray<TooltipEntry>
  label?: unknown
  valueFormatter?: (value: unknown, name: string) => string
  labelFormatter?: (label: unknown) => string
}) {
  if (!active || !payload?.length) return null
  const heading = labelFormatter ? labelFormatter(label) : label != null ? String(label) : ''
  return (
    <div className="min-w-[140px] rounded-[10px] border border-dash-border bg-white px-3 py-2 text-xs shadow-dash-pop">
      {heading && <p className="mb-1.5 font-medium text-dash-ink">{heading}</p>}
      <div className="space-y-1">
        {payload.map((entry, index) => {
          const name = String(entry.name ?? entry.dataKey ?? '')
          const swatch =
            (entry.payload?.fill as string | undefined) ?? entry.color ?? entry.stroke ?? entry.fill
          return (
            <p key={`${name}-${index}`} className="flex items-center justify-between gap-4 text-dash-muted">
              <span className="flex items-center gap-1.5">
                <span className="dashboard-legend-dot" style={{ background: swatch }} aria-hidden />
                {name}
              </span>
              <span className="font-semibold tabular-nums text-dash-ink">
                {valueFormatter(entry.value, name)}
              </span>
            </p>
          )
        })}
      </div>
    </div>
  )
}

export function ChartLegend({
  items,
  className,
}: {
  items: { label: string; color: string; value?: string }[]
  className?: string
}) {
  return (
    <ul className={cn('dashboard-legend', className)}>
      {items.slice(0, CHART_MAX_SERIES).map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span className="dashboard-legend-dot" style={{ background: item.color }} aria-hidden />
          <span>{item.label}</span>
          {item.value && <span className="font-medium tabular-nums text-dash-ink">{item.value}</span>}
        </li>
      ))}
    </ul>
  )
}

function resolveSeries(series: ChartSeries[]) {
  return series.slice(0, CHART_MAX_SERIES).map((s, i) => ({
    ...s,
    color: s.color ?? CHART_SERIES[i],
  }))
}

export function AreaTrendChart({
  data,
  xKey,
  series,
  height = 260,
  valueFormatter = formatFull,
  yTickFormatter = formatCompact,
  xTickFormatter,
  labelFormatter,
  className,
}: {
  data: Array<Record<string, unknown>>
  xKey: string
  series: ChartSeries[]
  height?: number
  valueFormatter?: (value: unknown, name: string) => string
  yTickFormatter?: (value: unknown) => string
  xTickFormatter?: (value: unknown) => string
  labelFormatter?: (label: unknown) => string
  className?: string
}) {
  const gradientId = useId().replace(/[^a-zA-Z0-9]/g, '')
  if (!data.length) return null
  const resolved = resolveSeries(series)

  return (
    <div className={cn('min-w-0', className)}>
      {resolved.length > 1 && (
        <ChartLegend
          className="mb-3"
          items={resolved.map((s) => ({ label: s.name, color: s.color }))}
        />
      )}
      <ResponsiveContainer width="100%" height={height} style={{ overflow: 'visible' }}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            {resolved.map((s) => (
              <linearGradient
                key={s.key}
                id={`${gradientId}-${s.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={s.color} stopOpacity={0.16} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.01} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke={CHART_GRID} strokeWidth={1} vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            minTickGap={24}
            tickFormatter={xTickFormatter}
          />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={yTickFormatter}
          />
          <Tooltip
            {...TOOLTIP_PROPS}
            cursor={{ stroke: CHART_CURSOR, strokeWidth: 1 }}
            content={
              <ChartTooltipCard valueFormatter={valueFormatter} labelFormatter={labelFormatter} />
            }
          />
          {resolved.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              fill={`url(#${gradientId}-${s.key})`}
              dot={false}
              activeDot={{ r: 4, fill: s.color, stroke: '#FFFFFF', strokeWidth: 2 }}
              animationDuration={500}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function BarTrendChart({
  data,
  xKey,
  yKey,
  name,
  height = 240,
  color = CHART_SERIES[1],
  highlightPeak = true,
  valueFormatter = formatFull,
  xTickFormatter,
  labelFormatter,
  className,
}: {
  data: Array<Record<string, unknown>>
  xKey: string
  yKey: string
  name: string
  height?: number
  color?: string
  highlightPeak?: boolean
  valueFormatter?: (value: unknown, name: string) => string
  xTickFormatter?: (value: unknown) => string
  labelFormatter?: (label: unknown) => string
  className?: string
}) {
  const gradientId = useId().replace(/[^a-zA-Z0-9]/g, '')
  if (!data.length) return null

  const values = data.map((d) => {
    const n = Number(d[yKey])
    return Number.isFinite(n) ? n : 0
  })
  const max = Math.max(...values)
  const peakIndex = highlightPeak && max > 0 ? values.indexOf(max) : -1
  const fillFor = (index: number) =>
    !highlightPeak ? color : index === peakIndex ? `url(#${gradientId}-peak)` : CHART_MUTED_BAR

  return (
    <div className={cn('min-w-0', className)}>
      <ResponsiveContainer width="100%" height={height} style={{ overflow: 'visible' }}>
        <BarChart data={data} margin={{ top: 24, right: 4, left: 4, bottom: 0 }} barCategoryGap="24%">
          <defs>
            <linearGradient id={`${gradientId}-peak`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={1} />
              <stop offset="100%" stopColor={color} stopOpacity={0.55} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={CHART_GRID} strokeWidth={1} vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            minTickGap={8}
            tickFormatter={xTickFormatter}
          />
          <YAxis hide domain={[0, (dataMax: number) => (dataMax > 0 ? dataMax : 1)]} />
          <Tooltip
            {...TOOLTIP_PROPS}
            cursor={{ fill: 'rgba(16, 24, 40, 0.03)' }}
            content={
              <ChartTooltipCard valueFormatter={valueFormatter} labelFormatter={labelFormatter} />
            }
          />
          <Bar
            dataKey={yKey}
            name={name}
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
            animationDuration={500}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={fillFor(index)} />
            ))}
            {peakIndex >= 0 && (
              <LabelList
                dataKey={yKey}
                content={(props) => {
                  if (props.index !== peakIndex) return null
                  const x = Number(props.x ?? 0)
                  const y = Number(props.y ?? 0)
                  const width = Number(props.width ?? 0)
                  return (
                    <text
                      x={x + width / 2}
                      y={y - 8}
                      textAnchor="middle"
                      fontSize={12}
                      fontWeight={600}
                      fill={CHART_INK}
                    >
                      {formatCompact(props.value)}
                    </text>
                  )
                }}
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export interface DonutDatum {
  name: string
  value: number
}

export function foldDonutData(data: DonutDatum[], maxSlices = CHART_MAX_SERIES): DonutDatum[] {
  const clean = data.filter((d) => Number.isFinite(d.value) && d.value > 0)
  if (clean.length <= maxSlices) return clean
  const ranked = [...clean].sort((a, b) => b.value - a.value)
  const kept = new Set(ranked.slice(0, maxSlices - 1).map((d) => d.name))
  const other = clean.filter((d) => !kept.has(d.name)).reduce((sum, d) => sum + d.value, 0)
  return [...clean.filter((d) => kept.has(d.name)), { name: 'Other', value: other }]
}

export function DonutChart({
  data,
  height = 150,
  centerLabel,
  valueFormatter = formatFull,
  className,
}: {
  data: DonutDatum[]
  height?: number
  centerLabel?: string
  valueFormatter?: (value: unknown, name: string) => string
  className?: string
}) {
  const slices = foldDonutData(data)
  if (!slices.length) return null
  const total = slices.reduce((sum, d) => sum + d.value, 0)
  const colored = slices.map((d, i) => ({ ...d, fill: CHART_SERIES[i] }))

  return (
    <div className={cn('min-w-0', className)}>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
        {colored.map((d) => (
          <li key={d.name} className="min-w-0 border-l-2 pl-2.5" style={{ borderColor: d.fill }}>
            <p className="truncate text-xs text-dash-muted">{d.name}</p>
            <p className="text-lg font-semibold leading-6 tabular-nums text-dash-ink">
              {valueFormatter(d.value, d.name)}
            </p>
            <p className="text-[11px] tabular-nums text-dash-dim">
              {total > 0 ? `${((d.value / total) * 100).toFixed(1)}%` : '—'}
            </p>
          </li>
        ))}
      </ul>
      <div
        className="relative mx-auto mt-5 w-full"
        style={{ maxWidth: height * 2, aspectRatio: '2 / 1' }}
      >
        <ResponsiveContainer width="100%" height="100%" style={{ overflow: 'visible' }}>
          <PieChart margin={{ top: 2, right: 2, bottom: 0, left: 2 }}>
            <Pie
              data={colored}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius="130%"
              outerRadius="196%"
              paddingAngle={1.5}
              cornerRadius={4}
              stroke="#FFFFFF"
              strokeWidth={2}
              animationDuration={500}
            >
              {colored.map((d) => (
                <Cell key={d.name} fill={d.fill} />
              ))}
            </Pie>
            <Tooltip
              {...TOOLTIP_PROPS}
              content={<ChartTooltipCard valueFormatter={valueFormatter} />}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 text-center">
          <p className="text-xl font-semibold leading-7 tabular-nums text-dash-ink">
            {formatCompact(total)}
          </p>
          {centerLabel && <p className="text-[11px] text-dash-muted">{centerLabel}</p>}
        </div>
      </div>
    </div>
  )
}
