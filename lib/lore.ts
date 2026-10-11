export type Chapter = { level: number; title: string; text: string }

export const WORLD_INTRO =
  'Somewhere in Helsinki there is a realm called Ilmiö. The old stories say three founders carried the first desk through its door in the winter of 2021, and that the realm has been finding people for other realms ever since. Every traveller who steps through walks the same road, one chapter at a time. Each day at the office is a step. Each closed week is a page.'

export const CHAPTERS: Chapter[] = [
  { level: 1, title: 'The door at the edge of the map', text: 'A door at the edge of the map opens on its own. Past it, a faint glow that the locals call WiFi and a hum that turns out to be someone on a call. You step through to see what the fuss is about.' },
  { level: 2, title: 'The Machine', text: 'The road ends at the Machine, an old device that has fuelled Ilmiö since the beginning. It hisses at newcomers. By the third visit it stops, and someone shows you where the good beans are kept.' },
  { level: 3, title: 'A chair of your own', text: 'Every seat belongs to someone, or to no one yet. You learn which chairs wobble, where the chargers hide and which window gets the afternoon sun. A traveller with a desk is harder to lose.' },
  { level: 4, title: 'The corridors make sense', text: 'The shortcuts are mapped now. You know which room is quiet enough for a candidate call and which one echoes. Others begin to expect your shadow in the doorway.' },
  { level: 5, title: 'The kitchen table', text: 'Stories are traded over lunch: the role that closed in a week, the one that took a season. You find that the real work of the realm happens in these rooms between the meetings.' },
  { level: 6, title: 'Part of the beat', text: 'The place has a rhythm, Friday soundtrack included, and you are now part of it. When you are away, people notice the quiet.' },
  { level: 7, title: 'Holding the fort', text: 'Others plan their weeks around the days you are here. Your name sits in schedules you have never seen, and clients ask for you by it.' },
  { level: 8, title: 'The one who points the way', text: 'New travellers arrive lost. You are the one who points to the Machine, the good desk and the shortcut, and who remembers which client likes their CVs short.' },
  { level: 9, title: 'A full year on the map', text: 'The old hands have a name for you and the newcomers have heard the stories. The map of Ilmiö has your footprints on it.' },
  { level: 10, title: 'Told through you', text: 'The realm no longer needs to be explored by you. When people describe Ilmiö, they are describing you.' },
]

export const HAUNTING =
  'Once a year, in the last week of October, the realm is not itself. Five ghosts move into Ilmiö: one in the Machine, one under the good desk, one in the quiet call room, two in the kitchen. They feed on empty chairs. Every day a traveller spends at the office banishes a little of them, and when the whole team has logged enough days the office is clear again. The travellers who stood their ground for two days or more are remembered as Ghost hunters.'

export function chapterFor(level: number): Chapter {
  return CHAPTERS.find(c => c.level === level) ?? CHAPTERS[0]
}

export const EVENT_NAMES: Record<string, string> = {
  days: 'Days on the map',
  bonus_3plus: 'Steady steps',
  bonus_full_week: 'A full week in the realm',
  office_warrior: 'Lone guardian',
  streak: 'Unbroken chain',
  event_ghost_hunter: 'Ghost hunter',
}

export function eventName(type: string): string {
  return EVENT_NAMES[type] ?? type
}
