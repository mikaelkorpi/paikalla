export type Chapter = { level: number; title: string; text: string }

export const CHAPTERS: Chapter[] = [
  { level: 1, title: 'The door at the edge of the map', text: 'A door at the edge of the map opens on its own. Past it, a faint glow that the locals call WiFi. You step through to see what it is.' },
  { level: 2, title: 'The Machine', text: 'The road ends at the Machine, an old device that has served travellers for generations. It hisses at newcomers. By the third visit it stops.' },
  { level: 3, title: 'A chair of your own', text: 'Every seat belongs to someone, or to no one yet. You learn which chairs wobble, where the chargers hide and which window gets the afternoon sun.' },
  { level: 4, title: 'The corridors make sense', text: 'The shortcuts are mapped now. Others begin to expect your shadow in the doorway, and the Machine no longer hisses at all.' },
  { level: 5, title: 'The kitchen table', text: 'Stories are traded over lunch. You find that the real work of the realm happens in these rooms between the meetings.' },
  { level: 6, title: 'Part of the beat', text: 'The place has a rhythm and you are now part of it. When you are away, people notice the quiet.' },
  { level: 7, title: 'Holding the fort', text: 'Others plan their weeks around the days you are here. Your name sits in schedules you have never seen.' },
  { level: 8, title: 'The one who points the way', text: 'New travellers arrive lost. You are the one who points to the Machine, the good desk and the shortcut.' },
  { level: 9, title: 'A full year on the map', text: 'The old hands have a name for you and the newcomers have heard the stories. The map has your footprints on it.' },
  { level: 10, title: 'Told through you', text: 'The realm no longer needs to be explored by you. It is told through you.' },
]

export function chapterFor(level: number): Chapter {
  return CHAPTERS.find(c => c.level === level) ?? CHAPTERS[0]
}

export const EVENT_NAMES: Record<string, string> = {
  days: 'Days on the map',
  bonus_3plus: 'Steady steps',
  bonus_full_week: 'A full week in the realm',
  office_warrior: 'Lone guardian',
  streak: 'Unbroken chain',
}

export function eventName(type: string): string {
  return EVENT_NAMES[type] ?? type
}
