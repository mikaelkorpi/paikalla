// Wearables unlock per traveller level. Furniture unlocks from the whole team's XP.
// Unlocks are derived from total_xp, so existing XP carries over as is.
// What each person wears is their own choice (users.outfit), picked from the Wardrobe in Slack.
export type Slot = 'head' | 'face' | 'hand' | 'back'

export type Wearable = { key: string; name: string; slot: Slot; level: number }

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
]

// A saved outfit maps slot -> item key, or 'none' for an empty slot.
export type Outfit = Partial<Record<Slot, string>>

export function wearable(key: string): Wearable | undefined {
  return WEARABLES.find(w => w.key === key)
}

export function unlockedWearables(level: number): Wearable[] {
  return WEARABLES.filter(w => level >= w.level)
}

// Default look for someone who has not picked anything yet: just the newest hat they have unlocked.
function defaultOutfit(level: number): Outfit {
  const outfit: Outfit = {}
  for (const w of WEARABLES) if (level >= w.level && w.slot === 'head') outfit.head = w.key
  return outfit
}

// What the avatar actually wears. Saved choices win, but only for items the person has unlocked.
export function outfitFor(level: number, saved?: Outfit | null): Outfit {
  if (!saved || Object.keys(saved).length === 0) return defaultOutfit(level)
  const outfit: Outfit = {}
  for (const { key: slot } of SLOTS) {
    const choice = saved[slot]
    if (!choice || choice === 'none') continue
    const item = wearable(choice)
    if (item && item.slot === slot && level >= item.level) outfit[slot] = item.key
  }
  return outfit
}

// Keeps only valid, unlocked choices. Used when saving from Slack.
export function cleanOutfit(level: number, input: Record<string, string | undefined>): Outfit {
  const out: Outfit = {}
  for (const { key: slot } of SLOTS) {
    const choice = input[slot]
    if (!choice) continue
    if (choice === 'none') { out[slot] = 'none'; continue }
    const item = wearable(choice)
    if (item && item.slot === slot && level >= item.level) out[slot] = item.key
  }
  return out
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
