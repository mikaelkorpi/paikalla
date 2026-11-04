import { supabaseAdmin as supabase } from '@/lib/supabase'
import { Leaderboard } from '@/components/Leaderboard'
import { WeekView } from '@/components/WeekView'
import { getCurrentWeekStart, formatWeekLabel } from '@/lib/week'
import { getEventForWeek, eventStatus } from '@/lib/events'
import { OfficeWorld } from '@/components/OfficeWorld'
import { Wardrobe } from '@/components/Wardrobe'
import { Avatar } from '@/lib/avatar'
import { lookFor } from '@/lib/looks'
import { outfitFor, nextFurniture, FURNITURE } from '@/lib/wardrobe'
import { getLevel } from '@/lib/levels'
import { loadOutfits } from '@/lib/outfits'

export const revalidate = 30

function helsinkiWeekday(): number | null {
  const name = new Date().toLocaleDateString('en-US', { weekday: 'short', timeZone: 'Europe/Helsinki' })
  const idx = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].indexOf(name)
  return idx === -1 ? null : idx + 1
}

export default async function DashboardPage() {
  const weekStart = getCurrentWeekStart()
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const [{ data: week }, { data: users }, outfits] = await Promise.all([
    supabase.from('weeks').select('id, is_closed').eq('week_start', weekStartStr).maybeSingle(),
    supabase.from('users').select('id, display_name, avatar_url, total_xp, level').order('total_xp', { ascending: false }),
    loadOutfits(),
  ])

  const attendances: any[] = []
  const weekXpMap: Record<string, number> = {}

  if (week) {
    const [{ data: att }, { data: xpEvents }] = await Promise.all([
      supabase.from('attendance').select('user_id, days, users(display_name)').eq('week_id', week.id),
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

  const today = helsinkiWeekday()
  const allUsers = (users ?? []).map(u => ({ ...u, outfit: outfits[u.id] ?? null }))
  const teamXp = allUsers.reduce((s, u) => s + u.total_xp, 0)
  const inIds = new Set(today ? attendances.filter(a => a.days.includes(today)).map(a => a.user_id) : [])
  const inOffice = allUsers.filter(u => inIds.has(u.id))
  const elsewhere = allUsers.filter(u => !inIds.has(u.id))
  const nextF = nextFurniture(teamXp)
  const prevF = [...FURNITURE].reverse().find(f => f.teamXp <= teamXp)
  const sign = today === null ? 'CLOSED FOR THE WEEKEND' : inOffice.length === 0 ? 'NOBODY IN TODAY' : null
  const dayLabel = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'numeric', timeZone: 'Europe/Helsinki' })

  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">
        <header className="pt-4">
          <h1 className="font-pixel text-[22px] sm:text-[28px]" style={{ color: 'var(--gold)' }}>
            OFFICE QUEST
          </h1>
          <p className="mt-2 max-w-prose" style={{ color: 'var(--text-muted)' }}>
            Who shows up at the Ilmiö office today, and how far each traveller has come.
            <span className="blink" aria-hidden="true">_</span>
          </p>
          <nav className="mt-4 flex gap-3 text-[17px]">
            <a href="/wardrobe" className="px-btn">My wardrobe</a>
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
            <p className="mt-1 text-[18px]" style={{ color: 'var(--text-muted)' }}>
              {Math.min(eventState.totalDays, event.teamGoalDays)} of {event.teamGoalDays} team office days. <a href="/lore" className="underline">Read the story</a>
            </p>
          </section>
        )}

        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-pixel text-[12px]">THE OFFICE</h2>
            <span style={{ color: 'var(--text-muted)' }}>{dayLabel}</span>
          </div>
          <div className="px-box p-1 sm:p-2" style={{ background: '#0b1020' }}>
            <OfficeWorld inOffice={inOffice} teamXp={teamXp} sign={sign} />
          </div>
          {elsewhere.length > 0 && (
            <div className="mt-3 px-box-inset p-3">
              <p className="font-pixel text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>ELSEWHERE {today === null ? 'THIS WEEKEND' : 'TODAY'}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {elsewhere.map(u => (
                  <a key={u.id} href={`/player/${u.id}`} className="flex items-center gap-1 no-underline" style={{ color: 'var(--text-muted)' }}>
                    <Avatar look={lookFor(u.display_name, u.id)} outfit={outfitFor(getLevel(u.total_xp).level, u.outfit)} size={52} title={u.display_name} />
                    <span>{u.display_name.split(' ')[0]}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
          <div className="mt-3">
            <div className="flex justify-between flex-wrap gap-x-3" style={{ color: 'var(--text-muted)' }}>
              <span>Team XP {teamXp.toLocaleString('fi-FI')}</span>
              {nextF ? <span>Next for the office: <span style={{ color: 'var(--gold)' }}>{nextF.name}</span> at {nextF.teamXp.toLocaleString('fi-FI')}</span> : <span style={{ color: 'var(--gold)' }}>The office is complete</span>}
            </div>
            {nextF && (
              <div className="mt-1 flex gap-[3px]" aria-hidden="true">
                {Array.from({ length: 20 }).map((_, i) => {
                  const from = prevF?.teamXp ?? 0
                  const p = (teamXp - from) / (nextF.teamXp - from)
                  return <div key={i} className="h-3 flex-1" style={{ backgroundColor: i < Math.round(p * 20) ? 'var(--gold)' : 'var(--bg)', border: '2px solid var(--bg-card2)' }} />
                })}
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-pixel text-[12px]">THIS WEEK</h2>
            <span style={{ color: 'var(--text-muted)' }}>
              {formatWeekLabel(weekStart)}{week?.is_closed ? ', closed' : ''}
            </span>
          </div>
          <div className="px-box p-3 sm:p-4">
            <WeekView attendances={attendances as any} isClosed={week?.is_closed ?? false} today={today} />
          </div>
        </section>

        <section>
          <h2 className="font-pixel text-[12px] mb-3">HALL OF FAME</h2>
          <Leaderboard users={allUsers} weekXpMap={weekXpMap} />
        </section>

        <section id="wardrobe">
          <h2 className="font-pixel text-[12px] mb-1">WARDROBE</h2>
          <p className="mb-3" style={{ color: 'var(--text-muted)' }}>Every item in the realm. Pick what you wear in <a href="/wardrobe" className="underline">My wardrobe</a>.</p>
          <Wardrobe users={allUsers} />
        </section>

        <footer className="pt-6" style={{ color: 'var(--text-faint)' }}>
          Log your days from the weekly poll in Slack. XP is awarded when the week closes on Friday. Your XP unlocks things to wear, which you pick in My wardrobe, and together the team&apos;s XP furnishes the office.
        </footer>
      </div>
    </main>
  )
}
