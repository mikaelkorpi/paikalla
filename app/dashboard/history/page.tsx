import { supabaseAdmin as supabase } from '@/lib/supabase'
import { AttendanceHistory } from '@/components/AttendanceHistory'
import { getLevel, getNextLevel } from '@/lib/levels'

export const revalidate = 60

export default async function HistoryPage() {
  const { data: users } = await supabase
    .from('users')
    .select('id, display_name, total_xp, level')
    .order('total_xp', { ascending: false })

  const { data: weeks } = await supabase
    .from('weeks')
    .select('id, week_start')
    .order('week_start', { ascending: true })

  const { data: allAttendance } = await supabase
    .from('attendance')
    .select('user_id, week_id, days')

  const monthMap: Record<string, Record<string, number>> = {}
  for (const a of allAttendance ?? []) {
    const week = weeks?.find(w => w.id === a.week_id)
    if (!week) continue
    const month = week.week_start.slice(0, 7)
    if (!monthMap[month]) monthMap[month] = {}
    const user = users?.find(u => u.id === a.user_id)
    if (!user) continue
    monthMap[month][user.display_name] = (monthMap[month][user.display_name] ?? 0) + a.days.length
  }

  const months = Object.keys(monthMap).sort()
  const historyData = months.map(m => ({ month: m.slice(5), ...monthMap[m] }))
  const names = users?.map(u => u.display_name) ?? []

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-xs text-blue-500 hover:underline">← Back</a>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text)' }}>History</h1>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Office days per month</h2>
          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <AttendanceHistory data={historyData} names={names} />
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Personal stats</h2>
          <div className="space-y-3">
            {(users ?? []).map(user => {
              const userAttendance = allAttendance?.filter(a => a.user_id === user.id) ?? []
              const totalDays = userAttendance.reduce((s, a) => s + a.days.length, 0)
              const levelInfo = getLevel(user.total_xp)
              const nextLevel = getNextLevel(user.total_xp)
              const xpToNext = nextLevel ? nextLevel.minXp - user.total_xp : 0
              return (
                <div key={user.id} className="rounded-xl border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{levelInfo.emoji}</span>
                    <p className="font-semibold" style={{ color: 'var(--text)' }}>{user.display_name}</p>
                    <span className="text-xs ml-auto" style={{ color: 'var(--text-faint)' }}>Lv{levelInfo.level} · {levelInfo.title}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <span>Total days: <strong style={{ color: 'var(--text)' }}>{totalDays}</strong></span>
                    <span>XP: <strong style={{ color: 'var(--text)' }}>{user.total_xp}</strong></span>
                    {nextLevel && <span>To next level: <strong style={{ color: 'var(--text)' }}>{xpToNext} XP</strong></span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
