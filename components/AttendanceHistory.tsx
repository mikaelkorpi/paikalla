'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type HistoryEntry = {
  month: string
  [name: string]: number | string
}

const COLORS = ['#4560E8', '#E8832A', '#F5C518', '#10B981', '#8B5CF6', '#EF4444']

export function AttendanceHistory({ data, names }: { data: HistoryEntry[]; names: string[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {names.map((name, i) => (
          <Bar key={name} dataKey={name} fill={COLORS[i % COLORS.length]} stackId="a" />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
