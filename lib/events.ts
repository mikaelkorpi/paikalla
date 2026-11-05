// Seasonal team quests. One entry per event week; the rest of the app reads these.
// When the team reaches the goal, everyone with enough days that week gets the bonus XP.
// That XP row (xp_events.type = xpType) is also what unlocks the event's badge and gear.
export type TeamEvent = {
  key: string
  weekStart: string        // Monday, YYYY-MM-DD
  title: string
  xpType: string           // stored in xp_events.type
  xpName: string           // shown in the quest log
  teamGoalDays: number     // office days across the whole team
  minDaysForBonus: number  // per person
  bonusXp: number
  meterSize: number        // meter length
  open: string             // emoji for what is still left to do
  done: string             // emoji for what the team has done
  copy: EventCopy
  badge: { name: string; icon: string }
  gear?: string            // wearable key unlocked by this week's bonus
}

type EventCopy = {
  start: (e: TeamEvent) => string
  progress: (done: number, left: number, days: number, toGo: number) => string
  reached: (e: TeamEvent) => string
  won: (e: TeamEvent) => string
  lost: (e: TeamEvent, days: number) => string
}

const HAUNTING_COPY: EventCopy = {
  start: e => `${e.meterSize} ghosts haunt the office. No one has dared enter yet. ${e.teamGoalDays} office days from the whole team banish them; be in for ${e.minDaysForBonus}+ days to earn +${e.bonusXp} XP.`,
  progress: (done, left, days, toGo) => done === 0
    ? `${left} ghosts still haunt the office. ${days} office days logged, ${toGo} to go.`
    : `${done} ${done === 1 ? 'ghost' : 'ghosts'} banished, ${left} left. ${days} office days logged, ${toGo} to go.`,
  reached: e => `The office is clear. Ghost hunters (${e.minDaysForBonus}+ days) earn +${e.bonusXp} XP when the week closes.`,
  won: e => `The office is clear. Everyone with ${e.minDaysForBonus}+ days this week earned +${e.bonusXp} XP as a Ghost hunter.`,
  lost: (e, days) => `The ghosts stayed. ${days} office days were logged, ${e.teamGoalDays} were needed. They will be back.`,
}

function adventCopy(week: number, gearName: string): EventCopy {
  return {
    start: e => `Advent week ${week} of 3. The long night has reached Ilmiö and ${e.meterSize} candles wait to be lit. ${e.teamGoalDays} office days from the whole team light them all; be in for ${e.minDaysForBonus}+ days to earn +${e.bonusXp} XP and the ${gearName}.`,
    progress: (done, left, days, toGo) => done === 0
      ? `${left} candles are still dark. ${days} office days logged, ${toGo} to go.`
      : `${done} ${done === 1 ? 'candle' : 'candles'} lit, ${left} still dark. ${days} office days logged, ${toGo} to go.`,
    reached: e => `Every candle is lit. Everyone with ${e.minDaysForBonus}+ days gets +${e.bonusXp} XP and the ${gearName} when the week closes.`,
    won: e => `Every candle burned this week. Everyone with ${e.minDaysForBonus}+ days earned +${e.bonusXp} XP and the ${gearName}.`,
    lost: (e, days) => `Some candles stayed dark. ${days} office days were logged, ${e.teamGoalDays} were needed.`,
  }
}

const ADVENT_BASE = { teamGoalDays: 10, minDaysForBonus: 2, bonusXp: 40, meterSize: 5, open: '🕯️', done: '🔥' }

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
    meterSize: 5,
    open: '👻',
    done: '✨',
    copy: HAUNTING_COPY,
    badge: { name: 'Ghost hunter 2026', icon: '👻' },
  },
  {
    ...ADVENT_BASE,
    key: 'advent-2026-1',
    weekStart: '2026-11-30',
    title: 'The Long Night: First Light',
    xpType: 'event_advent_1',
    xpName: 'First light',
    copy: adventCopy(1, 'Elf hat'),
    badge: { name: 'First light 2026', icon: '🕯️' },
    gear: 'elfhat',
  },
  {
    ...ADVENT_BASE,
    key: 'advent-2026-2',
    weekStart: '2026-12-07',
    title: 'The Long Night: Frost Week',
    xpType: 'event_advent_2',
    xpName: 'Frost keeper',
    copy: adventCopy(2, 'Gingerbread'),
    badge: { name: 'Frost keeper 2026', icon: '❄️' },
    gear: 'gingerbread',
  },
  {
    ...ADVENT_BASE,
    key: 'advent-2026-3',
    weekStart: '2026-12-14',
    title: 'The Long Night: Midwinter Feast',
    xpType: 'event_advent_3',
    xpName: 'Midwinter guest',
    copy: adventCopy(3, 'Reindeer antlers'),
    badge: { name: 'Midwinter guest 2026', icon: '🦌' },
    gear: 'antlers',
  },
]

export function getEventForWeek(weekStartStr: string): TeamEvent | null {
  return EVENTS.find(e => e.weekStart === weekStartStr) ?? null
}

export function eventByXpType(type: string): TeamEvent | null {
  return EVENTS.find(e => e.xpType === type) ?? null
}

export type EventStatus = {
  totalDays: number
  done: number
  remaining: number
  won: boolean
  meter: string
  text: string
}

export function eventStatus(event: TeamEvent, totalDays: number, isClosed: boolean): EventStatus {
  const done = Math.min(event.meterSize, Math.floor((totalDays / event.teamGoalDays) * event.meterSize))
  const remaining = event.meterSize - done
  const won = totalDays >= event.teamGoalDays
  const meter = event.open.repeat(remaining) + event.done.repeat(done)
  const toGo = Math.max(0, event.teamGoalDays - totalDays)

  let text: string
  if (isClosed) text = won ? event.copy.won(event) : event.copy.lost(event, totalDays)
  else if (totalDays === 0) text = event.copy.start(event)
  else if (won) text = event.copy.reached(event)
  else text = event.copy.progress(done, remaining, totalDays, toGo)

  return { totalDays, done, remaining, won, meter, text }
}
