import { LEVELS } from '@/lib/levels'
import { CHAPTERS } from '@/lib/lore'
import { Sprite } from '@/lib/sprite'

export default function LorePage() {
  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <header>
          <a href="/dashboard" className="px-btn text-[17px]">Back</a>
          <h1 className="font-pixel text-[20px] mt-6" style={{ color: 'var(--gold)' }}>THE STORY</h1>
          <p className="mt-3 max-w-prose" style={{ color: 'var(--text-muted)' }}>
            The Office is a realm with a door at its edge. Every traveller who steps through walks the same road,
            one chapter at a time. Each day at the office is a step. Each closed week is a page.
          </p>
        </header>

        <ol className="space-y-5">
          {CHAPTERS.map(ch => {
            const level = LEVELS.find(l => l.level === ch.level)!
            return (
              <li key={ch.level} className="px-box p-4 flex gap-4">
                <Sprite level={ch.level} size={64} title={level.title} />
                <div className="min-w-0">
                  <p className="font-pixel text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    LEVEL {ch.level} / {level.minXp} XP
                  </p>
                  <h2 className="text-[24px] leading-tight mt-1">{level.title}</h2>
                  <p className="text-[17px]" style={{ color: 'var(--gold)' }}>{ch.title}</p>
                  <p className="mt-2 max-w-prose" style={{ color: 'var(--text-muted)' }}>{ch.text}</p>
                </div>
              </li>
            )
          })}
        </ol>

        <section className="px-box p-4">
          <h2 className="font-pixel text-[12px] mb-3">HOW XP IS EARNED</h2>
          <ul className="space-y-1" style={{ color: 'var(--text-muted)' }}>
            <li>Days on the map: 15 XP for each day at the office.</li>
            <li>Steady steps: 20 XP for three or more days in a week.</li>
            <li>A full week in the realm: 50 XP for all five days.</li>
            <li>Lone guardian: 30 XP for being the only one in on a given day.</li>
            <li>Unbroken chain: 100 XP for four weeks in a row.</li>
          </ul>
        </section>
      </div>
    </main>
  )
}
