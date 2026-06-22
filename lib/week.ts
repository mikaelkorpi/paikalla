export function getCurrentWeekStart(): Date {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Helsinki' }))
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

export function formatWeekLabel(weekStart: Date): string {
  const wn = getWeekNumber(weekStart)
  const end = new Date(weekStart)
  end.setDate(weekStart.getDate() + 4)
  const fmt = (d: Date) => `${d.getDate()}.${d.getMonth() + 1}.`
  return `vk ${wn} · ${fmt(weekStart)}-${fmt(end)}`
}

export function isPollOpen(week: { week_start: string; is_closed: boolean }): boolean {
  if (week.is_closed) return false
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Helsinki' }))
  const weekStart = new Date(week.week_start)
  const open = new Date(weekStart)
  open.setHours(8, 0, 0, 0)
  const close = new Date(weekStart)
  close.setDate(weekStart.getDate() + 4)
  close.setHours(15, 0, 0, 0)
  return now >= open && now < close
}
