const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const DAY_NUMS = [1, 2, 3, 4, 5]

type Attendance = {
  days: number[]
  users: { display_name: string }
}

export function WeekView({
  attendances,
  isClosed,
  today,
}: {
  attendances: Attendance[]
  isClosed: boolean
  today: number | null
}) {
  const byDay: Record<number, string[]> = {}
  for (const a of attendances) {
    for (const d of a.days) {
      if (!byDay[d]) byDay[d] = []
      byDay[d].push(a.users.display_name)
    }
  }

  return (
    <div className="grid grid-cols-5 gap-2 sm:gap-3">
      {DAY_NUMS.map((d, i) => {
        const isToday = today === d && !isClosed
        return (
          <div
            key={d}
            className="px-box-inset p-2 min-h-[7rem]"
            style={isToday ? { borderColor: 'var(--gold)' } : undefined}
          >
            <p className="font-pixel text-[10px] mb-2" style={{ color: isToday ? 'var(--gold)' : 'var(--text-muted)' }}>
              {DAYS[i]}
            </p>
            <div className="space-y-0.5">
              {(byDay[d] ?? []).map(name => (
                <p key={name} className="truncate leading-tight">{name}</p>
              ))}
              {(byDay[d] ?? []).length === 0 && <p style={{ color: 'var(--text-faint)' }}>–</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
