import { supabaseAdmin as supabase } from '@/lib/supabase'
import { Leaderboard } from '@/components/Leaderboard'
import { WeekView } from '@/components/WeekView'
import { ThemeToggle } from '@/components/ThemeToggle'
import { getCurrentWeekStart, formatWeekLabel } from '@/lib/week'

export const revalidate = 30

export default async function DashboardPage() {
  const weekStart = getCurrentWeekStart()
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const [{ data: week }, { data: users }] = await Promise.all([
    supabase.from('weeks').select('id, is_closed').eq('week_start', weekStartStr).single(),
    supabase.from('users').select('id, display_name, avatar_url, total_xp, level').order('total_xp', { ascending: false }),
  ])

  const attendances: any[] = []
  const weekXpMap: Record<string, number> = {}

  if (week) {
    const [{ data: att }, { data: xpEvents }] = await Promise.all([
      supabase.from('attendance').select('days, users(display_name)').eq('week_id', week.id),
      supabase.from('xp_events').select('user_id, xp').eq('week_id', week.id),
    ])
    attendances.push(...(att ?? []))
    for (const e of xpEvents ?? []) {
      weekXpMap[e.user_id] = (weekXpMap[e.user_id] ?? 0) + e.xp
    }
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between py-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight" style={{ color: 'var(--text)' }}>Paikalla</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{formatWeekLabel(weekStart)} · Office Attendance Tracker</p>
          </div>
          <ThemeToggle />
        </div>

        <div className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>This Week</h2>
            {week?.is_closed && <span className="text-xs px-2 py-0.5 rounded" style={{ color: 'var(--text-faint)', backgroundColor: 'var(--bg-card2)' }}>closed</span>}
          </div>
          <WeekView attendances={attendances as any} isClosed={week?.is_closed ?? false} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Office Quest</h2>
            <a href="/dashboard/history" className="text-xs text-blue-500 hover:underline">History →</a>
          </div>
          <Leaderboard users={users ?? []} weekXpMap={weekXpMap} />
        </div>
      </div>
    </main>
  )
}
