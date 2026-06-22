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
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-sm text-blue-600 hover:underline">← Takaisin</a>
          <h1 className="text-2xl font-bold text-gray-900">Historia</h1>
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Toimistopäivät kuukausittain</h2>
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <AttendanceHistory data={historyData} names={names} />
          </div>
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Henkilökohtaiset tilastot</h2>
          <div className="space-y-3">
            {(users ?? []).map(user => {
              const userAttendance = allAttendance?.filter(a => a.user_id === user.id) ?? []
              const totalDays = userAttendance.reduce((s, a) => s + a.days.length, 0)
              const levelInfo = getLevel(user.total_xp)
              const nextLevel = getNextLevel(user.total_xp)
              const xpToNext = nextLevel ? nextLevel.minXp - user.total_xp : 0
              return (
                <div key={user.id} className="bg-white border border-gray-100 rounded-lg p-4">
                  <p className="font-semibold text-gray-900">{user.display_name}</p>
                  <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600">
                    <span>Päiviä yhteensä: <strong>{totalDays}</strong></span>
                    <span>Taso: <strong>Lv{levelInfo.level} {levelInfo.title}</strong></span>
                    <span>XP: <strong>{user.total_xp}</strong></span>
                    {nextLevel && <span>Seuraavaan tasoon: <strong>{xpToNext} XP</strong></span>}
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
