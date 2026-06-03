'use client'

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const COLORS = ['#7c3aed', '#0AC5D7', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#0891A3']

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; name: string; color?: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-brand border border-surface-border/80 bg-white px-3 py-2 shadow-glass text-xs">
      {label && <p className="font-medium text-ink mb-1">{label}</p>}
      {payload.map((entry) => (
        <p key={entry.name} className="text-ink-muted tabular-nums">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle" style={{ background: entry.color }} />
          {entry.name}: <span className="font-semibold text-ink">{entry.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  )
}

export function AdminLineChart({
  data,
  xKey,
  yKey,
  height = 240,
  color = '#7c3aed',
}: {
  data: Array<Record<string, unknown>>
  xKey: string
  yKey: string
  height?: number
  color?: string
}) {
  if (!data.length) return null
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#71717a' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#71717a' }} tickLine={false} axisLine={false} width={40} />
        <Tooltip content={<ChartTooltip />} />
        <Line
          type="monotone"
          dataKey={yKey}
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function AdminBarChart({
  data,
  xKey,
  yKey,
  height = 240,
}: {
  data: Array<Record<string, unknown>>
  xKey: string
  yKey: string
  height?: number
}) {
  if (!data.length) return null
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#71717a' }} tickLine={false} axisLine={false} width={40} />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey={yKey} fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function AdminPieChart({
  data,
  nameKey,
  valueKey,
  height = 220,
}: {
  data: Array<Record<string, unknown>>
  nameKey: string
  valueKey: string
  height?: number
}) {
  if (!data.length) return null
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          innerRadius={48}
          outerRadius={72}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 11 }}
          formatter={(value) => <span className="text-ink-muted">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function AdminDualLineChart({
  data,
  xKey,
  lines,
  height = 260,
}: {
  data: Array<Record<string, unknown>>
  xKey: string
  lines: { key: string; color: string; name: string }[]
  height?: number
}) {
  if (!data.length) return null
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#71717a' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#71717a' }} tickLine={false} axisLine={false} width={40} />
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.name}
            stroke={line.color}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
