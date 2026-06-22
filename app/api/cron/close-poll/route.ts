import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { slack } from '@/lib/slack'
import { getCurrentWeekStart } from '@/lib/week'
import { buildPollBlocks } from '@/lib/poll'
import { awardXpForWeek } from '@/lib/xp'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const weekStart = getCurrentWeekStart()
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const { data: week } = await supabaseAdmin
    .from('weeks')
    .select('id, slack_message_ts')
    .eq('week_start', weekStartStr)
    .eq('is_closed', false)
    .single()

  if (!week) {
    return Response.json({ ok: true, skipped: true })
  }

  await supabaseAdmin.from('weeks').update({ is_closed: true }).eq('id', week.id)

  const warriorUserIds = await awardXpForWeek(week.id)

  if (week.slack_message_ts) {
    const { data: attendances } = await supabaseAdmin
      .from('attendance')
      .select('days, users(display_name)')
      .eq('week_id', week.id)

    const attendanceByDay: Record<number, string[]> = {}
    for (const a of (attendances ?? []) as any[]) {
      for (const d of a.days) {
        if (!attendanceByDay[d]) attendanceByDay[d] = []
        attendanceByDay[d].push(a.users.display_name)
      }
    }

    const blocks = buildPollBlocks(weekStart, attendanceByDay, true)
    await slack.chat.update({
      channel: process.env.SLACK_CHANNEL_ID!,
      ts: week.slack_message_ts,
      blocks: blocks as any,
      text: 'In the office this week (closed)',
    })
  }

  for (const userId of warriorUserIds) {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('slack_user_id')
      .eq('id', userId)
      .single()

    if (user?.slack_user_id) {
      const dm = await slack.conversations.open({ users: user.slack_user_id })
      if ((dm.channel as any)?.id) {
        await slack.chat.postMessage({
          channel: (dm.channel as any).id,
          text: 'Teit sen taas. Olet tällä viikolla toimiston ainoa asukas ainakin yhtenä päivänä.\n+30 XP Office Warrior -bonuksesta. Nautitaan yksinäisyydestä.',
        })
      }
    }
  }

  return Response.json({ ok: true })
}
