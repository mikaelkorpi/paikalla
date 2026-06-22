import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { slack } from '@/lib/slack'
import { getCurrentWeekStart } from '@/lib/week'
import { buildPollBlocks } from '@/lib/poll'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const weekStart = getCurrentWeekStart()
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const { data: existing, error: existingError } = await supabaseAdmin
    .from('weeks')
    .select('id')
    .eq('week_start', weekStartStr)
    .maybeSingle()

  if (existing) {
    return Response.json({ ok: true, skipped: true, weekStartStr, existingId: existing.id })
  }

  if (existingError) {
    return Response.json({ ok: false, step: 'check-existing', error: existingError.message }, { status: 500 })
  }

  const { data: week, error } = await supabaseAdmin
    .from('weeks')
    .insert({ week_start: weekStartStr, is_closed: false })
    .select()
    .single()

  if (error || !week) {
    return Response.json({ error: error?.message }, { status: 500 })
  }

  const blocks = buildPollBlocks(weekStart, {}, false)

  const msg = await slack.chat.postMessage({
    channel: process.env.SLACK_CHANNEL_ID!,
    blocks: blocks as any,
    text: 'Toimistolla tällä viikolla?',
  })

  await supabaseAdmin
    .from('weeks')
    .update({ slack_message_ts: msg.ts })
    .eq('id', week.id)

  return Response.json({ ok: true })
}
