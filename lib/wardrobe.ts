// Wearables unlock per traveller level. Event gear unlocks from a won event week (see lib/events.ts).
// Furniture unlocks from the whole team's XP.
// Unlocks are derived from total_xp and xp_events, so existing XP carries over as is.
// What each person wears is their own choice (users.outfit), picked in My wardrobe (/wardrobe).
export type Slot = 'head' | 'face' | 'hand' | 'back'

// event: the xp_events.type that unlocks this item. Event items ignore level.
export type Wearable = { key: string; name: string; slot: Slot; level: number; event?: string; eventName?: string }

// Event xp types a traveller has earned, e.g. ['event_advent_1']
export type Earned = string[]

export const SLOTS: { key: Slot; name: string }[] = [
  { key: 'head', name: 'Head' },
  { key: 'face', name: 'Face' },
  { key: 'hand', name: 'Hand' },
  { key: 'back', name: 'Back' },
]

export const WEARABLES: Wearable[] = [
  { key: 'glasses',    name: 'Reading glasses',  slot: 'face', level: 1 },
  { key: 'mug',        name: 'Machine mug',      slot: 'hand', level: 2 },
  { key: 'partyhat',   name: 'Party hat',        slot: 'head', level: 2 },
  { key: 'beanie',     name: 'Beanie',           slot: 'head', level: 3 },
  { key: 'backpack',   name: 'Commuter backpack', slot: 'back', level: 3 },
  { key: 'headphones', name: 'Focus headphones', slot: 'head', level: 4 },
  { key: 'laptop',     name: 'Laptop',           slot: 'hand', level: 4 },
  { key: 'shades',     name: 'Pixel shades',     slot: 'face', level: 5 },
  { key: 'cap',        name: 'Ilmiö cap',        slot: 'head', level: 6 },
  { key: 'wizard',     name: 'Wizard hat',       slot: 'head', level: 7 },
  { key: 'viking',     name: 'Viking helmet',    slot: 'head', level: 8 },
  { key: 'monocle',    name: 'Monocle',          slot: 'face', level: 8 },
  { key: 'tophat',     name: 'Top hat',          slot: 'head', level: 9 },
  { key: 'trophy',     name: 'Champion trophy',  slot: 'hand', level: 9 },
  { key: 'crown',      name: 'Crown',            slot: 'head', level: 10 },
  { key: 'cape',       name: 'Legend cape',      slot: 'back', level: 10 },
  // Event gear: The Long Night (advent 2026)
  { key: 'elfhat',      name: 'Elf hat',          slot: 'head', level: 99, event: 'event_advent_1', eventName: 'Advent week 1' },
  { key: 'gingerbread', name: 'Gingerbread',      slot: 'hand', level: 99, event: 'event_advent_2', eventName: 'Advent week 2' },
  { key: 'antlers',     name: 'Reindeer antlers', slot: 'head', level: 99, event: 'event_advent_3', eventName: 'Advent week 3' },
]

export function isUnlocked(w: Wearable, level: number, earned: Earned = []): boolean {
  return w.event ? earned.includes(w.event) : level >= w.level
}

export function countUnlocked(level: number, earned: Earned = []): number {
  return WEARABLES.filter(w => isUnlocked(w, level, earned)).length
}

// A saved outfit maps slot -> item key, or 'none' for an empty slot.
// loadOutfits() also attaches the traveller's earned event types, so every
// outfitFor(level, u.outfit) call can show event gear without extra lookups.
export type Outfit = Partial<Record<Slot, string>> & { earned?: Earned }

export function wearable(key: string): Wearable | undefined {
  return WEARABLES.find(w => w.key === key)
}

export function unlockedWearables(level: number, earned: Earned = []): Wearable[] {
  return WEARABLES.filter(w => isUnlocked(w, level, earned))
}

// Default look for someone who has not picked anything yet: just the newest hat they have unlocked.
function defaultOutfit(level: number): Outfit {
  const outfit: Outfit = {}
  for (const w of WEARABLES) if (!w.event && level >= w.level && w.slot === 'head') outfit.head = w.key
  return outfit
}

// What the avatar actually wears. Saved choices win, but only for items the person has unlocked.
export function outfitFor(level: number, saved?: Outfit | null): Outfit {
  const earned = saved?.earned ?? []
  if (!saved || SLOTS.every(s => !saved[s.key])) return defaultOutfit(level)
  const outfit: Outfit = {}
  for (const { key: slot } of SLOTS) {
    const choice = saved[slot]
    if (!choice || choice === 'none') continue
    const item = wearable(choice)
    if (item && item.slot === slot && isUnlocked(item, level, earned)) outfit[slot] = item.key
  }
  return outfit
}

// Keeps only valid, unlocked choices. Used when saving from My wardrobe.
export function cleanOutfit(level: number, input: Record<string, unknown>, earned: Earned = []): Outfit {
  const out: Outfit = {}
  for (const { key: slot } of SLOTS) {
    const choice = input[slot]
    if (!choice || typeof choice !== 'string') continue
    if (choice === 'none') { out[slot] = 'none'; continue }
    const item = wearable(choice)
    if (item && item.slot === slot && isUnlocked(item, level, earned)) out[slot] = item.key
  }
  return out
}

export function nextWearable(level: number): Wearable | null {
  return WEARABLES.find(w => !w.event && w.level > level) ?? null
}

export type Furniture = { key: string; name: string; teamXp: number }

export const FURNITURE: Furniture[] = [
  { key: 'machine',  name: 'The Machine',     teamXp: 0 },
  { key: 'desks',    name: 'Desks',           teamXp: 0 },
  { key: 'rug',      name: 'Rug',             teamXp: 0 },
  { key: 'plant',    name: 'Monstera',        teamXp: 1000 },
  { key: 'sofa',     name: 'Sofa',            teamXp: 2000 },
  { key: 'shelf',    name: 'Bookshelf',       teamXp: 3500 },
  { key: 'jukebox',  name: 'Friday jukebox',  teamXp: 5000 },
  { key: 'arcade',   name: 'Arcade cabinet',  teamXp: 6500 },
  { key: 'aquarium', name: 'Aquarium',        teamXp: 8000 },
  { key: 'neon',     name: 'Neon sign',       teamXp: 10000 },
  { key: 'ballpit',  name: 'Ball pit',        teamXp: 13000 },
  { key: 'throne',   name: 'The Throne',      teamXp: 16000 },
]

export function unlockedFurniture(teamXp: number): Set<string> {
  return new Set(FURNITURE.filter(f => teamXp >= f.teamXp).map(f => f.key))
}

export function nextFurniture(teamXp: number): Furniture | null {
  return FURNITURE.find(f => f.teamXp > teamXp) ?? null
}
