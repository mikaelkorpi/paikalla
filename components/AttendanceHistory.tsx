'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useEffect, useState } from 'react'

type HistoryEntry = {
  month: string
  [name: string]: number | string
}

const COLORS = ['#60A5FA', '#34D399', '#F97316', '#A78BFA', '#EAB308', '#F472B6']

export function AttendanceHistory({ data, names }: { data: HistoryEntry[]; names: string[] }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setDark(mq.matches)
    const handler = (e: MediaQueryListEvent) => setDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const textColor = dark ? '#9ca3af' : '#64748b'
  const gridColor = dark ? '#1f2937' : '#e2e8f0'
  const tooltipBg = dark ? '#111827' : '#ffffff'
  const tooltipBorder = dark ? '#1f2937' : '#e2e8f0'

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: textColor }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: textColor }} />
        {names.map((name, i) => (
          <Bar key={name} dataKey={name} fill={COLORS[i % COLORS.length]} stackId="a" radius={i === names.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
