export const LEVELS = [
  { level: 1, minXp: 0,    title: 'Remote Wanderer',    emoji: '🌫️', lore: 'A mysterious figure seen only on video calls. Rumored to exist.' },
  { level: 2, minXp: 150,  title: 'Occasional Visitor',  emoji: '🚶', lore: 'Has found the office once. The coffee machine recognized them... barely.' },
  { level: 3, minXp: 400,  title: 'Office Dweller',      emoji: '🏠', lore: 'Claims a desk. Knows where the good snacks are hidden.' },
  { level: 4, minXp: 800,  title: 'Permanent Fixture',   emoji: '⚔️', lore: 'The plants have started to nod at them. The chair fits perfectly.' },
  { level: 5, minXp: 1500, title: 'Office Overlord',     emoji: '🔥', lore: 'Controls the thermostat. Knows all the meeting room codes. Do not challenge.' },
  { level: 6, minXp: 2500, title: 'Office Legend',       emoji: '👑', lore: 'Ancient beyond reckoning. The office was built around them. They remember the old printer.' },
]

export function getLevel(xp: number) {
  return [...LEVELS].reverse().find(l => xp >= l.minXp) ?? LEVELS[0]
}

export function getNextLevel(xp: number) {
  const current = getLevel(xp)
  return LEVELS.find(l => l.level === current.level + 1) ?? null
}

export function levelColor(level: number): string {
  if (level <= 2) return '#6B7280'   // gray
  if (level <= 4) return '#3B82F6'   // blue
  if (level === 5) return '#F97316'  // orange
  return '#EAB308'                   // gold
}
