const DAYS = ['Ma', 'Ti', 'Ke', 'To', 'Pe']
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
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-base font-semibold text-gray-900">Tällä viikolla</h2>
        {isClosed && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">suljettu</span>}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {DAY_NUMS.map((d, i) => (
          <div key={d} className="bg-white border border-gray-100 rounded-lg p-3">
            <p className="text-xs font-bold text-gray-500 mb-2">{DAYS[i]}</p>
            <div className="space-y-1">
              {(byDay[d] ?? []).map(name => (
                <p key={name} className="text-xs text-gray-800 truncate">{name}</p>
              ))}
              {(byDay[d] ?? []).length === 0 && <p className="text-xs text-gray-300">–</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
