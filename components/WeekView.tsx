const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const DAY_NUMS = [1, 2, 3, 4, 5]

type Attendance = {
  days: number[]
  users: { display_name: string }
}

export function WeekView({ attendances, isClosed }: { attendances: Attendance[]; isClosed: boolean }) {
  const byDay: Record<number, string[]> = {}
  for (const a of attendances) {
    for (const d of a.days) {
      if (!byDay[d]) byDay[d] = []
      byDay[d].push(a.users.display_name)
    }
  }

  return (
    <div className="grid grid-cols-5 gap-2">
      {DAY_NUMS.map((d, i) => (
        <div key={d} className="rounded-lg p-2.5 border" style={{ backgroundColor: 'var(--bg-card2)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{DAYS[i]}</p>
          <div className="space-y-1">
            {(byDay[d] ?? []).map(name => (
              <p key={name} className="text-xs truncate" style={{ color: 'var(--text)' }}>{name}</p>
            ))}
            {(byDay[d] ?? []).length === 0 && <p className="text-xs" style={{ color: 'var(--text-faint)' }}>–</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
