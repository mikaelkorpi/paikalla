import { supabaseAdmin as supabase } from '@/lib/supabase'
import { currentUserId } from '@/lib/session'
import { getLevel } from '@/lib/levels'
import { lookFor } from '@/lib/looks'
import { outfitFor, SLOTS, WEARABLES, type Outfit } from '@/lib/wardrobe'
import { loadOutfits } from '@/lib/outfits'
import { WardrobePicker } from '@/components/WardrobePicker'

export const dynamic = 'force-dynamic'

const ERRORS: Record<string, string> = {
  unknown: 'Your Slack account is not in Paikalla yet. Log your office days once from the Slack poll and try again.',
  team: 'That Slack account is not in the Ilmiö workspace.',
}

export default async function WardrobePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  const userId = await currentUserId()

  const user = userId
    ? (await supabase.from('users').select('id, display_name, total_xp').eq('id', userId).maybeSingle()).data
    : null

  if (!user) {
    return (
      <main className="min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          <a href="/dashboard" className="px-btn text-[17px]">Back</a>
          <h1 className="font-pixel text-[20px]" style={{ color: 'var(--gold)' }}>MY WARDROBE</h1>
          <p className="max-w-prose" style={{ color: 'var(--text-muted)' }}>
            Sign in with your Ilmiö Slack account to choose what your traveller wears. Everything you have unlocked with XP is waiting here.
          </p>
          {error && <p style={{ color: '#ff7b7b' }}>{ERRORS[error] ?? 'Sign-in did not work. Try again.'}</p>}
          <a href="/api/auth/slack/login" className="px-btn">Sign in with Slack</a>
        </div>
      </main>
    )
  }

  const level = getLevel(user.total_xp ?? 0)
  const saved = (await loadOutfits([user.id]))[user.id] ?? null
  const wearing = outfitFor(level.level, saved)
  // Start from what the avatar wears now, with every other slot empty
  const initial: Outfit = Object.fromEntries(SLOTS.map(s => [s.key, wearing[s.key] ?? 'none']))
  const unlocked = WEARABLES.filter(w => level.level >= w.level).length

  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <a href="/dashboard" className="px-btn text-[17px]">Back</a>
        <header>
          <h1 className="font-pixel text-[20px]" style={{ color: 'var(--gold)' }}>MY WARDROBE</h1>
          <p className="mt-2" style={{ color: 'var(--text-muted)' }}>
            {user.display_name}, Lv{level.level} {level.title}. {unlocked} of {WEARABLES.length} items unlocked.
          </p>
        </header>
        <WardrobePicker look={lookFor(user.display_name, user.id)} level={level.level} initial={initial} />
      </div>
    </main>
  )
}
