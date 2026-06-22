import { supabaseAdmin } from './supabase'
import { getLevel } from './levels'

const XP_RULES = {
  PER_DAY: 15,
  BONUS_3_PLUS: 20,
  BONUS_FULL_WEEK: 50,
  OFFICE_WARRIOR: 30,
  STREAK_4_WEEKS: 100,
}

export async function awardXpForWeek(weekId: string): Promise<string[]> {
  const { data: attendances } = await supabaseAdmin
    .from('attendance')
    .select('user_id, days')
    .eq('week_id', weekId)

  if (!attendances || attendances.length === 0) return []

  const dayCounts: Record<number, string[]> = {}
  for (const a of attendances) {
    for (const d of a.days) {
      if (!dayCounts[d]) dayCounts[d] = []
      dayCounts[d].push(a.user_id)
    }
  }
  const warriorUserIds = new Set(
    Object.values(dayCounts).filter(users => users.length === 1).map(users => users[0])
  )

  const { data: week } = await supabaseAdmin
    .from('weeks')
    .select('week_start')
    .eq('id', weekId)
    .single()

  const weekStart = new Date(week!.week_start)
  const past3Mondays = [1, 2, 3].map(i => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() - 7 * i)
    return d.toISOString().split('T')[0]
  })

  const { data: pastWeeks } = await supabaseAdmin
    .from('weeks')
    .select('id, week_start')
    .in('week_start', past3Mondays)

  const officeWarriorUsers: string[] = []

  for (const a of attendances) {
    const daysCount = a.days.length
    if (daysCount === 0) continue

    const events: { type: string; xp: number; description: string }[] = []

    events.push({
      type: 'days',
      xp: XP_RULES.PER_DAY * daysCount,
      description: `${daysCount} päivää toimistolla`,
    })

    if (daysCount === 5) {
      events.push({ type: 'bonus_full_week', xp: XP_RULES.BONUS_FULL_WEEK, description: 'Täysi viikko toimistolla' })
    } else if (daysCount >= 3) {
      events.push({ type: 'bonus_3plus', xp: XP_RULES.BONUS_3_PLUS, description: '3+ päivää toimistolla' })
    }

    if (warriorUserIds.has(a.user_id)) {
      events.push({ type: 'office_warrior', xp: XP_RULES.OFFICE_WARRIOR, description: 'Ainoa toimistolla yhtenä päivänä' })
      officeWarriorUsers.push(a.user_id)
    }

    if (pastWeeks && pastWeeks.length === 3) {
      const pastWeekIds = pastWeeks.map(w => w.id)
      const { data: pastAttendances } = await supabaseAdmin
        .from('attendance')
        .select('week_id, days')
        .eq('user_id', a.user_id)
        .in('week_id', pastWeekIds)

      const attendedWeeks = new Set((pastAttendances ?? []).filter(pa => pa.days.length > 0).map(pa => pa.week_id))
      if (attendedWeeks.size === 3) {
        events.push({ type: 'streak', xp: XP_RULES.STREAK_4_WEEKS, description: '4 viikon putki' })
      }
    }

    const totalXp = events.reduce((s, e) => s + e.xp, 0)

    await supabaseAdmin.from('xp_events').insert(
      events.map(e => ({ user_id: a.user_id, week_id: weekId, ...e }))
    )

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('total_xp')
      .eq('id', a.user_id)
      .single()

    const newXp = (user?.total_xp ?? 0) + totalXp
    const newLevel = getLevel(newXp)

    await supabaseAdmin
      .from('users')
      .update({ total_xp: newXp, level: newLevel.level })
      .eq('id', a.user_id)
  }

  return officeWarriorUsers
}
