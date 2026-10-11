import { supabaseAdmin } from './supabase'
import { slack } from './slack'
import { buildPollBlocks } from './poll'

export async function openPollForWeek(weekStart: Date) {
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const { data: existing, error: existingError } = await supabaseAdmin
    .from('weeks')
    .select('id')
    .eq('week_start', weekStartStr)
    .maybeSingle()

  if (existingError) return { ok: false, step: 'check-existing', error: existingError.message }
  if (existing) return { ok: true, skipped: true, weekStartStr, existingId: existing.id }

  const { data: week, error } = await supabaseAdmin
    .from('weeks')
    .insert({ week_start: weekStartStr, is_closed: false })
    .select()
    .single()

  if (error || !week) return { ok: false, step: 'insert', error: error?.message }

  const msg = await slack.chat.postMessage({
    channel: process.env.SLACK_CHANNEL_ID!,
    blocks: buildPollBlocks(weekStart, {}, false) as any,
    text: 'Who is in the office next week?',
  })

  await supabaseAdmin.from('weeks').update({ slack_message_ts: msg.ts }).eq('id', week.id)
  return { ok: true, weekStartStr }
}
