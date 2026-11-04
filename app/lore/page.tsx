import { LEVELS } from '@/lib/levels'
import { CHAPTERS, WORLD_INTRO, HAUNTING, TRAVELLERS, THE_OFFICE, FURNITURE_LORE } from '@/lib/lore'
import { Sprite } from '@/lib/sprite'
import { Avatar } from '@/lib/avatar'
import { WEARABLES, FURNITURE, type Outfit } from '@/lib/wardrobe'
import type { Look } from '@/lib/looks'

// A nameless traveller used to show what each chapter brings
const TRAVELLER: Look = { skin: '#e8b48c', hair: 'short', hairColor: '#6b4a2f', beard: 'none', top: '#2e86c1', pants: '#2f3a55' }

// What a traveller could wear at a level: the newest hat and the newest item in hand
function outfitAt(level: number): Outfit {
  const o: Outfit = {}
  for (const w of WEARABLES) if (w.level <= level && (w.slot === 'head' || w.slot === 'hand')) o[w.slot] = w.key
  return o
}

export default function LorePage() {
  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <header>
          <a href="/dashboard" className="px-btn text-[17px]">Back</a>
          <h1 className="font-pixel text-[20px] mt-6" style={{ color: 'var(--gold)' }}>THE STORY</h1>
          <p className="mt-3 max-w-prose" style={{ color: 'var(--text-muted)' }}>{WORLD_INTRO}</p>
        </header>

        <section className="px-box p-4">
          <h2 className="font-pixel text-[12px] mb-3">WHO WALKS THE ROAD</h2>
          <p className="max-w-prose" style={{ color: 'var(--text-muted)' }}>{TRAVELLERS}</p>
          <div className="flex flex-wrap items-end gap-3 mt-4">
            {[1, 3, 5, 7, 9, 10].map(l => (
              <div key={l} className="flex flex-col items-center">
                <Avatar look={TRAVELLER} outfit={outfitAt(l)} size={96} title={`Level ${l}`} />
                <span className="text-[18px]" style={{ color: 'var(--text-muted)' }}>Lv{l}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="px-box p-4">
          <h2 className="font-pixel text-[12px] mb-3">THE OFFICE</h2>
          <p className="max-w-prose" style={{ color: 'var(--text-muted)' }}>{THE_OFFICE}</p>
          <ul className="mt-4 space-y-2">
            {FURNITURE.map(f => (
              <li key={f.key} className="flex gap-3">
                <span className="w-24 shrink-0 text-right" style={{ color: 'var(--gold)' }}>
                  {f.teamXp === 0 ? 'From day one' : `${f.teamXp.toLocaleString('fi-FI')} XP`}
                </span>
                <span>
                  {f.name}. <span style={{ color: 'var(--text-muted)' }}>{FURNITURE_LORE[f.key]}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <ol className="space-y-5">
          {CHAPTERS.map(ch => {
            const level = LEVELS.find(l => l.level === ch.level)!
            const unlocks = WEARABLES.filter(w => w.level === ch.level)
            return (
              <li key={ch.level} className="px-box p-4 flex gap-4">
                <div className="shrink-0">
                  <Avatar look={TRAVELLER} outfit={outfitAt(ch.level)} size={96} title={level.title} />
                </div>
                <div className="min-w-0">
                  <p className="font-pixel text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    LEVEL {ch.level} / {level.minXp} XP
                  </p>
                  <h2 className="text-[24px] leading-tight mt-1">{level.title}</h2>
                  <p className="text-[17px]" style={{ color: 'var(--gold)' }}>{ch.title}</p>
                  <p className="mt-2 max-w-prose" style={{ color: 'var(--text-muted)' }}>{ch.text}</p>
                  {unlocks.length > 0 && (
                    <p className="mt-2 text-[17px]" style={{ color: 'var(--green)' }}>
                      Unlocks: {unlocks.map(w => w.name).join(', ')}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ol>

        <section className="px-box p-4" style={{ borderColor: 'var(--gold)' }}>
          <div className="flex gap-4">
            <Sprite seed="haunting" species="ghost" level={1} size={64} title="Ghost" />
            <div>
              <h2 className="font-pixel text-[12px] mb-2" style={{ color: 'var(--gold)' }}>THE HAUNTING OF ILMIÖ</h2>
              <p className="max-w-prose" style={{ color: 'var(--text-muted)' }}>{HAUNTING}</p>
            </div>
          </div>
        </section>

        <section className="px-box p-4">
          <h2 className="font-pixel text-[12px] mb-3">HOW XP IS EARNED</h2>
          <ul className="space-y-1" style={{ color: 'var(--text-muted)' }}>
            <li>Days on the map: 15 XP for each day at the office.</li>
            <li>Steady steps: 20 XP for three or more days in a week.</li>
            <li>A full week in the realm: 50 XP for all five days.</li>
            <li>Lone guardian: 30 XP for being the only one in on a given day.</li>
            <li>Unbroken chain: 100 XP for four weeks in a row.</li>
            <li>Ghost hunter: 40 XP for 2+ days during the Haunting, if the team banishes the ghosts.</li>
          </ul>
          <p className="mt-3" style={{ color: 'var(--text-muted)' }}>
            Your own XP raises your level and opens the wardrobe. Everyone&apos;s XP together furnishes the office.
          </p>
        </section>
      </div>
    </main>
  )
}
