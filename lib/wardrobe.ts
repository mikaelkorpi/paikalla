// Wearables unlock per traveller level. Furniture unlocks from the whole team's XP.
// Nothing is stored: both are derived from total_xp, so existing XP carries over as is.
export type Slot = 'head' | 'face' | 'hand' | 'back'

export type Wearable = { key: string; name: string; slot: Slot; level: number }

export const WEARABLES: Wearable[] = [
  { key: 'mug',        name: 'Machine mug',     slot: 'hand', level: 2 },
  { key: 'beanie',     name: 'Beanie',          slot: 'head', level: 3 },
  { key: 'headphones', name: 'Focus headphones', slot: 'head', level: 4 },
  { key: 'shades',     name: 'Pixel shades',    slot: 'face', level: 5 },
  { key: 'cap',        name: 'Ilmiö cap',       slot: 'head', level: 6 },
  { key: 'wizard',     name: 'Wizard hat',      slot: 'head', level: 7 },
  { key: 'viking',     name: 'Viking helmet',   slot: 'head', level: 8 },
  { key: 'tophat',     name: 'Top hat',         slot: 'head', level: 9 },
  { key: 'trophy',     name: 'Champion trophy', slot: 'hand', level: 9 },
  { key: 'crown',      name: 'Crown',           slot: 'head', level: 10 },
  { key: 'cape',       name: 'Legend cape',     slot: 'back', level: 10 },
]

export type Outfit = Partial<Record<Slot, string>>

// Each slot wears the newest item unlocked for that slot.
export function outfitFor(level: number): Outfit {
  const outfit: Outfit = {}
  for (const w of WEARABLES) if (level >= w.level) outfit[w.slot] = w.key
  return outfit
}

export function nextWearable(level: number): Wearable | null {
  return WEARABLES.find(w => w.level > level) ?? null
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
