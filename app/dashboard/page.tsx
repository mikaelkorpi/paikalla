import { supabaseAdmin as supabase } from '@/lib/supabase'
import { Leaderboard } from '@/components/Leaderboard'
import { WeekView } from '@/components/WeekView'
import { getCurrentWeekStart, formatWeekLabel } from '@/lib/week'
import { getEventForWeek, eventStatus } from '@/lib/events'

export const revalidate = 30

function helsinkiWeekday(): number | null {
  const name = new Date().toLocaleDateString('en-US', { weekday: 'short', timeZone: 'Europe/Helsinki' })
  const idx = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].indexOf(name)
  return idx === -1 ? null : idx + 1
}

export default async function DashboardPage() {
  const weekStart = getCurrentWeekStart()
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const [{ data: week }, { data: users }] = await Promise.all([
    supabase.from('weeks').select('id, is_closed').eq('week_start', weekStartStr).maybeSingle(),
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

  const event = getEventForWeek(weekStartStr)
  const eventState = event
    ? eventStatus(event, attendances.reduce((s, a) => s + a.days.length, 0), week?.is_closed ?? false)
    : null

  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">
        <header className="pt-4">
          <h1 className="font-pixel text-[22px] sm:text-[28px]" style={{ color: 'var(--gold)' }}>
            OFFICE QUEST
          </h1>
          <p className="mt-2 max-w-prose" style={{ color: 'var(--text-muted)' }}>
            Who shows up at the Ilmiö office, and how far each traveller has come.
            <span className="blink" aria-hidden="true">_</span>
          </p>
          <nav className="mt-4 flex gap-3 text-[17px]">
            <a href="/lore" className="px-btn">The story</a>
            <a href="/admin" className="px-btn">Admin</a>
          </nav>
        </header>

        {event && eventState && (
          <section className="px-box p-4" style={{ borderColor: 'var(--gold)' }}>
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <h2 className="font-pixel text-[12px]" style={{ color: 'var(--gold)' }}>{event.title.toUpperCase()}</h2>
              <span className="text-[22px] leading-none" aria-label={`${eventState.remaining} ghosts remaining`}>{eventState.meter}</span>
            </div>
            <p className="mt-2 max-w-prose">{eventState.text}</p>
            <div className="mt-3 flex gap-[3px]" aria-hidden="true">
              {Array.from({ length: event.teamGoalDays }).map((_, i) => (
                <div
                  key={i}
                  className="h-3 flex-1"
                  style={{ backgroundColor: i < eventState.totalDays ? 'var(--gold)' : 'var(--bg)', border: '2px solid var(--bg-card2)' }}
                />
              ))}
            </div>
            <p className="mt-1 text-[15px]" style={{ color: 'var(--text-muted)' }}>
              {Math.min(eventState.totalDays, event.teamGoalDays)} of {event.teamGoalDays} team office days. <a href="/lore" className="underline">Read the story</a>
            </p>
          </section>
        )}

        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-pixel text-[12px]">THIS WEEK</h2>
            <span style={{ color: 'var(--text-muted)' }}>
              {formatWeekLabel(weekStart)}{week?.is_closed ? ', closed' : ''}
            </span>
          </div>
          <div className="px-box p-3 sm:p-4">
            <WeekView attendances={attendances as any} isClosed={week?.is_closed ?? false} today={helsinkiWeekday()} />
          </div>
        </section>

        <section>
          <h2 className="font-pixel text-[12px] mb-3">HALL OF FAME</h2>
          <Leaderboard users={users ?? []} weekXpMap={weekXpMap} />
        </section>

        <footer className="pt-6" style={{ color: 'var(--text-faint)' }}>
          Log your days from the weekly poll in Slack. XP is awarded when the week closes on Friday.
        </footer>
      </div>
    </main>
  )
}
