import { EVENTS, eventByXpType } from './events'
import type { Earned } from './wardrobe'

// Badges shown on the player page and in My wardrobe.
// Two sources: event weeks won (xp_events, see lib/events.ts) and plant watering stars from Kastelija.
export type Badge = { key: string; name: string; icon: string; detail: string; source: 'event' | 'kastelija' }

// Kastelija: one badge for every 50 stars, up to 500.
export const STAR_BADGES: { stars: number; name: string; icon: string }[] = [
  { stars: 50,  name: 'Seedling',            icon: '🌱' },
  { stars: 100, name: 'Sprout',              icon: '🌿' },
  { stars: 150, name: 'Leaf keeper',         icon: '🍃' },
  { stars: 200, name: 'Green thumb',         icon: '🪴' },
  { stars: 250, name: 'Watering can',        icon: '💧' },
  { stars: 300, name: 'Rain maker',          icon: '🌧️' },
  { stars: 350, name: 'Greenhouse guardian', icon: '🏡' },
  { stars: 400, name: 'Jungle keeper',       icon: '🌴' },
  { stars: 450, name: 'Plant whisperer',     icon: '🍀' },
  { stars: 500, name: 'Kastelija legend',    icon: '👑' },
]

const KASTELIJA_URL = (process.env.KASTELIJA_URL ?? 'https://kastelija.ilmiotalent.fi').replace(/\/$/, '')

// Same names, different spellings across the two apps
const NAME_ALIASES: Record<string, string> = { mikke: 'mikael', sakke: 'sakari' }

export function nameKey(displayName: string): string {
  const first = displayName.trim().split(/\s+/)[0].toLowerCase()
  return NAME_ALIASES[first] ?? first
}

// Stars per first name from Kastelija's public summary. Cached for an hour.
// Returns {} if Kastelija cannot be reached, so pages still render.
export async function loadKastelijaStars(): Promise<Record<string, number>> {
  try {
    const res = await fetch(`${KASTELIJA_URL}/api/stars`, { next: { revalidate: 3600 } })
    if (!res.ok) return {}
    const json = (await res.json()) as { people?: { name: string; stars: number }[] }
    const map: Record<string, number> = {}
    for (const p of json.people ?? []) {
      const key = nameKey(p.name)
      map[key] = Math.max(map[key] ?? 0, Number(p.stars) || 0)
    }
    return map
  } catch {
    return {}
  }
}

export function badgesFor(earned: Earned, stars: number): Badge[] {
  const badges: Badge[] = []
  for (const type of earned) {
    const e = eventByXpType(type)
    if (e) badges.push({ key: e.key, name: e.badge.name, icon: e.badge.icon, detail: e.title, source: 'event' })
  }
  // Keep event badges in calendar order
  badges.sort((a, b) => EVENTS.findIndex(e => e.key === a.key) - EVENTS.findIndex(e => e.key === b.key))
  for (const b of STAR_BADGES) {
    if (stars >= b.stars) badges.push({ key: `stars-${b.stars}`, name: b.name, icon: b.icon, detail: `${b.stars} stars in Kastelija`, source: 'kastelija' })
  }
  return badges
}

export function nextStarBadge(stars: number) {
  return STAR_BADGES.find(b => b.stars > stars) ?? null
}
