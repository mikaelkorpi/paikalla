import { getLevel, getNextLevel } from './levels'
import { SLOTS, WEARABLES, outfitFor, unlockedWearables, type Outfit } from './wardrobe'

type Option = { text: { type: 'plain_text'; text: string }; value: string }

const opt = (text: string, value: string): Option => ({ text: { type: 'plain_text', text }, value })

// Slack modal where a traveller picks what to wear from the items they have unlocked.
export function buildWardrobeModal(totalXp: number, saved: Outfit | null, userId: string) {
  const level = getLevel(totalXp)
  const next = getNextLevel(totalXp)
  const unlocked = unlockedWearables(level.level)
  const wearing = outfitFor(level.level, saved)

  const blocks: object[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Lv${level.level} ${level.title}*, ${totalXp} XP. You have unlocked ${unlocked.length} of ${WEARABLES.length} items.` +
          (next ? `\n${next.minXp - totalXp} XP to Lv${next.level}.` : ''),
      },
    },
  ]

  for (const slot of SLOTS) {
    const items = unlocked.filter(w => w.slot === slot.key)
    const options = [opt('Nothing', 'none'), ...items.map(w => opt(w.name, w.key))]
    const current = wearing[slot.key] ?? 'none'
    const initial = options.find(o => o.value === current) ?? options[0]
    blocks.push({
      type: 'input',
      block_id: `slot_${slot.key}`,
      optional: true,
      label: { type: 'plain_text', text: slot.name },
      element: {
        type: 'static_select',
        action_id: 'pick',
        options,
        initial_option: initial,
      },
    })
  }

  const locked = WEARABLES.filter(w => w.level > level.level)
  if (locked.length > 0) {
    blocks.push({ type: 'divider' })
    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: '🔒 Still locked: ' + locked.map(w => `${w.name} (Lv${w.level})`).join(', '),
        },
      ],
    })
  }

  return {
    type: 'modal',
    callback_id: 'wardrobe_modal',
    private_metadata: userId,
    title: { type: 'plain_text', text: 'Wardrobe' },
    submit: { type: 'plain_text', text: 'Wear it' },
    close: { type: 'plain_text', text: 'Cancel' },
    blocks,
  }
}

// Reads the slot picks from a submitted wardrobe modal.
export function readWardrobeValues(values: Record<string, Record<string, { selected_option?: { value: string } }>>) {
  const out: Record<string, string | undefined> = {}
  for (const slot of SLOTS) {
    out[slot.key] = values?.[`slot_${slot.key}`]?.pick?.selected_option?.value
  }
  return out
}
