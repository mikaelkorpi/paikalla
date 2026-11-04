'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar } from '@/lib/avatar'
import { SLOTS, WEARABLES, type Outfit, type Slot } from '@/lib/wardrobe'
import type { Look } from '@/lib/looks'

// Pick one item (or nothing) per slot, see it on your avatar right away, then save.
export function WardrobePicker({ look, level, initial }: { look: Look; level: number; initial: Outfit }) {
  const router = useRouter()
  const [outfit, setOutfit] = useState<Outfit>(initial)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const choose = (slot: Slot, key: string) => {
    setOutfit(o => ({ ...o, [slot]: o[slot] === key ? 'none' : key }))
    setStatus('idle')
  }

  async function save() {
    setStatus('saving')
    const res = await fetch('/api/wardrobe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outfit }),
    })
    setStatus(res.ok ? 'saved' : 'error')
    if (res.ok) router.refresh()
  }

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.refresh()
  }

  const preview: Outfit = Object.fromEntries(Object.entries(outfit).filter(([, v]) => v && v !== 'none'))

  return (
    <div className="space-y-6">
      <div className="px-box p-4 flex items-center gap-5">
        <Avatar look={look} outfit={preview} size={176} title="Your traveller" />
        <div className="space-y-3">
          <button className="px-btn" onClick={save} disabled={status === 'saving'}>
            {status === 'saving' ? 'Saving…' : 'Wear this'}
          </button>
          <p style={{ color: status === 'error' ? '#ff7b7b' : 'var(--text-muted)' }}>
            {status === 'saved' && 'Saved. Your new look is live in the office.'}
            {status === 'error' && 'Could not save. Try again in a moment.'}
            {status === 'idle' && 'Tap an item to put it on, tap again to take it off.'}
          </p>
          <button className="underline text-[18px]" style={{ color: 'var(--text-faint)' }} onClick={signOut}>Sign out</button>
        </div>
      </div>

      {SLOTS.map(slot => (
        <section key={slot.key}>
          <h2 className="font-pixel text-[12px] mb-3">{slot.name.toUpperCase()}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {WEARABLES.filter(w => w.slot === slot.key).map(w => {
              const unlocked = level >= w.level
              const worn = outfit[slot.key] === w.key
              return (
                <button
                  key={w.key}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => choose(slot.key, w.key)}
                  aria-pressed={worn}
                  className="px-box-inset p-2 flex items-center gap-2 text-left"
                  style={{
                    borderColor: worn ? 'var(--gold)' : undefined,
                    opacity: unlocked ? 1 : 0.5,
                    cursor: unlocked ? 'pointer' : 'not-allowed',
                  }}
                >
                  <Avatar look={look} outfit={{ [w.slot]: w.key }} size={64} title={w.name} />
                  <span className="min-w-0">
                    <span className="block leading-tight">{w.name}</span>
                    <span className="block text-[18px]" style={{ color: worn ? 'var(--gold)' : unlocked ? 'var(--green)' : 'var(--text-faint)' }}>
                      {worn ? 'Wearing' : unlocked ? 'Unlocked' : `🔒 Lv${w.level}`}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
