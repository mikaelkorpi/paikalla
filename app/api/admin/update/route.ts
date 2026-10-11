import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { slack } from '@/lib/slack'
import { buildPollBlocks } from '@/lib/poll'
import { ADMIN_COOKIE, isAdminCookie } from '@/lib/admin'
import { recomputeXpForWeek } from '@/lib/xp'
import { getLevel } from '@/lib/levels'

async function syncSlackMessage(weekId: string) {
  const { data: week } = await supabaseAdmin
    .from('weeks')
    .select('week_start, is_closed, slack_message_ts')
    .eq('id', weekId)
    .single()
  if (!week?.slack_message_ts) return

  const { data: attendances } = await supabaseAdmin
    .from('attendance')
    .select('days, users(display_name)')
    .eq('week_id', weekId)

  const byDay: Record<number, string[]> = {}
  for (const a of (attendances ?? []) as any[]) {
    for (const d of a.days) {
      if (!byDay[d]) byDay[d] = []
      byDay[d].push(a.users.display_name)
    }
  }

  const weekStart = new Date(week.week_start)
  await slack.chat.update({
    channel: process.env.SLACK_CHANNEL_ID!,
    ts: week.slack_message_ts,
    blocks: buildPollBlocks(weekStart, byDay, week.is_closed) as any,
    text: week.is_closed ? 'In the office (closed)' : 'Who is in the office?',
  })
}

export async function POST(req: NextRequest) {
  if (!isAdminCookie(req.cookies.get(ADMIN_COOKIE)?.value)) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const weekId: string | undefined = body.weekId
  if (!weekId) return Response.json({ ok: false, error: 'weekId missing' }, { status: 400 })

  const { data: week } = await supabaseAdmin
    .from('weeks')
    .select('id, is_closed')
    .eq('id', weekId)
    .single()
  if (!week) return Response.json({ ok: false, error: 'Week not found' }, { status: 404 })

  if (body.action === 'save_attendance') {
    const entries: { userId: string; days: number[] }[] = body.entries ?? []
    for (const e of entries) {
      const days = [...new Set(e.days)].filter(d => d >= 1 && d <= 5).sort()
      if (days.length === 0) {
        await supabaseAdmin.from('attendance').delete().eq('user_id', e.userId).eq('week_id', weekId)
      } else {
        await supabaseAdmin
          .from('attendance')
          .upsert({ user_id: e.userId, week_id: weekId, days }, { onConflict: 'user_id,week_id' })
      }
    }
    if (week.is_closed) await recomputeXpForWeek(weekId)
    await syncSlackMessage(weekId)
    return Response.json({ ok: true })
  }

  if (body.action === 'close_week') {
    if (!week.is_closed) {
      await supabaseAdmin.from('weeks').update({ is_closed: true }).eq('id', weekId)
      await recomputeXpForWeek(weekId)
    }
    await syncSlackMessage(weekId)
    return Response.json({ ok: true })
  }

  if (body.action === 'reopen_week') {
    if (week.is_closed) {
      // Take back the week's XP; it is awarded again when the week is closed.
      await supabaseAdmin.from('weeks').update({ is_closed: false }).eq('id', weekId)
      const { data: oldEvents } = await supabaseAdmin
        .from('xp_events')
        .select('user_id, xp')
        .eq('week_id', weekId)
      const byUser: Record<string, number> = {}
      for (const ev of oldEvents ?? []) byUser[ev.user_id] = (byUser[ev.user_id] ?? 0) + ev.xp
      for (const [userId, xp] of Object.entries(byUser)) {
        const { data: user } = await supabaseAdmin.from('users').select('total_xp').eq('id', userId).single()
        const newXp = Math.max(0, (user?.total_xp ?? 0) - xp)
        await supabaseAdmin.from('users').update({ total_xp: newXp, level: getLevel(newXp).level }).eq('id', userId)
      }
      await supabaseAdmin.from('xp_events').delete().eq('week_id', weekId)
    }
    await syncSlackMessage(weekId)
    return Response.json({ ok: true })
  }

  return Response.json({ ok: false, error: 'Unknown action' }, { status: 400 })
}
