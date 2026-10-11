// Seasonal team quests. One entry per event week; the rest of the app reads these.
export type TeamEvent = {
  key: string
  weekStart: string        // Monday, YYYY-MM-DD
  title: string
  xpType: string           // stored in xp_events.type
  xpName: string           // shown in the quest log
  teamGoalDays: number     // office days across the whole team
  minDaysForBonus: number  // per person
  bonusXp: number
  ghosts: number           // meter length
}

export const EVENTS: TeamEvent[] = [
  {
    key: 'haunting-2026',
    weekStart: '2026-10-26',
    title: 'The Haunting of Ilmiö',
    xpType: 'event_ghost_hunter',
    xpName: 'Ghost hunter',
    teamGoalDays: 10,
    minDaysForBonus: 2,
    bonusXp: 40,
    ghosts: 5,
  },
]

export function getEventForWeek(weekStartStr: string): TeamEvent | null {
  return EVENTS.find(e => e.weekStart === weekStartStr) ?? null
}

export type EventStatus = {
  totalDays: number
  banished: number
  remaining: number
  won: boolean
  meter: string
  text: string
}

export function eventStatus(event: TeamEvent, totalDays: number, isClosed: boolean): EventStatus {
  const banished = Math.min(event.ghosts, Math.floor((totalDays / event.teamGoalDays) * event.ghosts))
  const remaining = event.ghosts - banished
  const won = totalDays >= event.teamGoalDays
  const meter = '👻'.repeat(remaining) + '✨'.repeat(banished)
  const toGo = Math.max(0, event.teamGoalDays - totalDays)

  let text: string
  if (isClosed) {
    text = won
      ? `The office is clear. Everyone with ${event.minDaysForBonus}+ days this week earned +${event.bonusXp} XP as a Ghost hunter.`
      : `The ghosts stayed. ${totalDays} office days were logged, ${event.teamGoalDays} were needed. They will be back.`
  } else if (totalDays === 0) {
    text = `${event.ghosts} ghosts haunt the office. No one has dared enter yet. ${event.teamGoalDays} office days from the whole team banish them; be in for ${event.minDaysForBonus}+ days to earn +${event.bonusXp} XP.`
  } else if (won) {
    text = `The office is clear. Ghost hunters (${event.minDaysForBonus}+ days) earn +${event.bonusXp} XP when the week closes.`
  } else if (banished === 0) {
    text = `${remaining} ghosts still haunt the office. ${totalDays} office days logged, ${toGo} to go.`
  } else {
    text = `${banished} ${banished === 1 ? 'ghost' : 'ghosts'} banished, ${remaining} left. ${totalDays} office days logged, ${toGo} to go.`
  }

  return { totalDays, banished, remaining, won, meter, text }
}
