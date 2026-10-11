import { notFound } from 'next/navigation'
import { supabaseAdmin as supabase } from '@/lib/supabase'
import { getLevel, levelColor } from '@/lib/levels'
import { chapterFor, eventName } from '@/lib/lore'
import { Sprite, speciesFor } from '@/lib/sprite'
import { XpBar } from '@/components/XpBar'
import { formatWeekLabel } from '@/lib/week'

export const revalidate = 60

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F']
const HEATMAP_WEEKS = 20

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: user } = await supabase
    .from('users')
    .select('id, display_name, total_xp, level')
    .eq('id', id)
    .maybeSingle()
  if (!user) notFound()

  const [{ data: weeks }, { data: attendance }, { data: events }] = await Promise.all([
    supabase.from('weeks').select('id, week_start, is_closed').order('week_start', { ascending: false }),
    supabase.from('attendance').select('week_id, days').eq('user_id', id),
    supabase.from('xp_events').select('week_id, type, xp, description').eq('user_id', id),
  ])

  const level = getLevel(user.total_xp)
  const chapter = chapterFor(level.level)
  const color = levelColor(level.level)
  const species = speciesFor(user.id)

  const daysByWeek: Record<string, number[]> = {}
  for (const a of attendance ?? []) daysByWeek[a.week_id] = a.days

  const allWeeks = weeks ?? []
  const totalDays = (attendance ?? []).reduce((s, a) => s + a.days.length, 0)
  const weeksAttended = (attendance ?? []).filter(a => a.days.length > 0).length

  // Current streak: consecutive closed weeks with at least one day, newest first
  let streak = 0
  for (const w of allWeeks.filter(w => w.is_closed)) {
    if ((daysByWeek[w.id] ?? []).length > 0) streak++
    else break
  }

  // Quest log: events grouped by week, newest first
  const eventsByWeek: Record<string, { type: string; xp: number; description: string }[]> = {}
  for (const e of events ?? []) {
    if (!eventsByWeek[e.week_id]) eventsByWeek[e.week_id] = []
    eventsByWeek[e.week_id].push(e)
  }
  const logWeeks = allWeeks.filter(w => eventsByWeek[w.id]?.length)

  const heatWeeks = [...allWeeks].slice(0, HEATMAP_WEEKS).reverse()

  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <a href="/dashboard" className="px-btn text-[17px]">Back</a>

        <section className="px-box p-4 sm:p-6">
          <div className="flex gap-4 sm:gap-6 items-start">
            <Sprite seed={user.id} level={level.level} size={120} title={`${species.name}, ${level.title}`} />
            <div className="min-w-0 flex-1">
              <h1 className="text-[28px] leading-tight truncate">{user.display_name}</h1>
              <p className="font-pixel text-[11px] mt-1" style={{ color }}>
                {species.name.toUpperCase()} LV{level.level} {level.title.toUpperCase()}
              </p>
              <p className="mt-3 text-[17px]" style={{ color: 'var(--gold)' }}>{chapter.title}</p>
              <p className="mt-1 max-w-prose" style={{ color: 'var(--text-muted)' }}>{chapter.text}</p>
            </div>
          </div>
          <div className="mt-5">
            <XpBar xp={user.total_xp} />
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3">
          {[
            { label: 'Days', value: totalDays },
            { label: 'Weeks', value: weeksAttended },
            { label: 'Streak', value: streak },
          ].map(s => (
            <div key={s.label} className="px-box p-3 text-center">
              <p className="font-pixel text-[18px]">{s.value}</p>
              <p style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </section>

        <section>
          <h2 className="font-pixel text-[12px] mb-3">FOOTPRINTS</h2>
          <div className="px-box p-3 overflow-x-auto">
            <div className="inline-grid gap-1" style={{ gridTemplateColumns: `auto repeat(${heatWeeks.length}, 14px)` }}>
              {DAY_LETTERS.map((d, r) => (
                <div key={r} className="contents">
                  <span className="text-[14px] pr-2 leading-[14px]" style={{ color: 'var(--text-faint)' }}>{d}</span>
                  {heatWeeks.map(w => {
                    const on = (daysByWeek[w.id] ?? []).includes(r + 1)
                    return (
                      <div
                        key={w.id}
                        title={formatWeekLabel(new Date(w.week_start))}
                        style={{ width: 14, height: 14, backgroundColor: on ? color : 'var(--bg)', border: '2px solid var(--bg-card2)' }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
            <p className="mt-2 text-[15px]" style={{ color: 'var(--text-faint)' }}>Last {heatWeeks.length} weeks, oldest on the left.</p>
          </div>
        </section>

        <section>
          <h2 className="font-pixel text-[12px] mb-3">QUEST LOG</h2>
          {logWeeks.length === 0 ? (
            <div className="px-box p-4" style={{ color: 'var(--text-muted)' }}>
              No chapters written yet. XP appears here after the first closed week.
            </div>
          ) : (
            <div className="space-y-3">
              {logWeeks.map(w => {
                const list = eventsByWeek[w.id]
                const total = list.reduce((s, e) => s + e.xp, 0)
                return (
                  <div key={w.id} className="px-box p-3">
                    <div className="flex justify-between">
                      <span>{formatWeekLabel(new Date(w.week_start))}</span>
                      <span style={{ color: 'var(--green)' }}>+{total} XP</span>
                    </div>
                    <ul className="mt-1 text-[17px]" style={{ color: 'var(--text-muted)' }}>
                      {list.map((e, i) => (
                        <li key={i} className="flex justify-between gap-3">
                          <span>{eventName(e.type)}</span>
                          <span>+{e.xp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
