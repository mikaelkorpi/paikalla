export const LEVELS = [
  { level: 1, minXp: 0,    title: 'Etäilijä' },
  { level: 2, minXp: 150,  title: 'Satunnainen vieras' },
  { level: 3, minXp: 400,  title: 'Toimistokäyttäjä' },
  { level: 4, minXp: 800,  title: 'Kiinteä kalusto' },
  { level: 5, minXp: 1500, title: 'Toimistolari' },
  { level: 6, minXp: 2500, title: 'Toimistolegenda' },
]

export function getLevel(xp: number) {
  return [...LEVELS].reverse().find(l => xp >= l.minXp) ?? LEVELS[0]
}

export function getNextLevel(xp: number) {
  const current = getLevel(xp)
  return LEVELS.find(l => l.level === current.level + 1) ?? null
}

export function levelColor(level: number): string {
  if (level <= 2) return '#6B7280'
  if (level <= 4) return '#4560E8'
  if (level === 5) return '#E8832A'
  return '#F5C518'
}
