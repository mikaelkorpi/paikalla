export const LEVELS = [
  { level: 1,  minXp: 0,    title: 'Office Curious',     emoji: '🔍', lore: 'Something drew you here. Maybe the WiFi. Maybe curiosity. Either way — welcome.' },
  { level: 2,  minXp: 150,  title: 'Coffee Pilgrim',      emoji: '☕', lore: 'You have made the journey. The coffee machine knows your face now.' },
  { level: 3,  minXp: 350,  title: 'Desk Finder',         emoji: '🗺️', lore: 'You know where to sit. You know where the chargers are. This is progress.' },
  { level: 4,  minXp: 600,  title: 'Regular Scout',       emoji: '🧭', lore: 'People have started to expect you. That is a good thing.' },
  { level: 5,  minXp: 900,  title: 'Culture Seeker',      emoji: '🌱', lore: 'You show up not just for the work, but for the energy. The team feels it.' },
  { level: 6,  minXp: 1250, title: 'Office Enthusiast',   emoji: '⚡', lore: 'Your presence has become part of the rhythm. The place is better when you are here.' },
  { level: 7,  minXp: 1650, title: 'Presence Pro',        emoji: '🎯', lore: 'Reliable. Consistent. People plan their days knowing you will be around.' },
  { level: 8,  minXp: 2100, title: 'Team Anchor',         emoji: '⚓', lore: 'You are the steady one. New people find their footing because of you.' },
  { level: 9,  minXp: 2600, title: 'Office Champion',     emoji: '🏆', lore: 'A year of showing up. Of coffees, of hallway chats, of being genuinely present.' },
  { level: 10, minXp: 3200, title: 'Living Legend',       emoji: '✨', lore: 'The office did not make you. You made the office. There is nothing left to prove.' },
]

export function getLevel(xp: number) {
  return [...LEVELS].reverse().find(l => xp >= l.minXp) ?? LEVELS[0]
}

export function getNextLevel(xp: number) {
  const current = getLevel(xp)
  return LEVELS.find(l => l.level === current.level + 1) ?? null
}

export function levelColor(level: number): string {
  if (level <= 2) return '#94A3B8'
  if (level <= 4) return '#60A5FA'
  if (level <= 6) return '#34D399'
  if (level <= 8) return '#F97316'
  if (level === 9) return '#A78BFA'
  return '#EAB308'
}
