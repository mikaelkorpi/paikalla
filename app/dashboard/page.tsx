import { supabaseAdmin as supabase } from '@/lib/supabase'
import { Leaderboard } from '@/components/Leaderboard'
import { WeekView } from '@/components/WeekView'
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
    <main className="min-h-screen bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center py-6">
          <h1 className="text-4xl font-black text-white tracking-tight">⚔️ Paikalla</h1>
          <p className="text-gray-400 mt-1 text-sm">{formatWeekLabel(weekStart)} · Office Attendance Tracker</p>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest">This Week</h2>
            {week?.is_closed && <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">closed</span>}
          </div>
          <WeekView attendances={attendances as any} isClosed={week?.is_closed ?? false} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest">🏆 Hall of Heroes</h2>
            <a href="/dashboard/history" className="text-xs text-blue-400 hover:underline">Historia →</a>
          </div>
          <Leaderboard users={users ?? []} weekXpMap={weekXpMap} />
        </div>
      </div>
    </main>
  )
}
