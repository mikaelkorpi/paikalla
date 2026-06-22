import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { slack, verifySlackSignature } from '@/lib/slack'
import { getCurrentWeekStart } from '@/lib/week'
import { buildModalView, buildPollBlocks } from '@/lib/poll'

async function getOrCreateUser(slackUserId: string) {
  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('slack_user_id', slackUserId)
    .single()

  if (existing) return existing

  const info = await slack.users.info({ user: slackUserId })
  const profile = (info.user as any)?.profile
  const displayName = profile?.display_name || profile?.real_name || slackUserId
  const avatarUrl = profile?.image_72 || null

  const { data: created } = await supabaseAdmin
    .from('users')
    .insert({ slack_user_id: slackUserId, display_name: displayName, avatar_url: avatarUrl })
    .select()
    .single()

  return created
}

async function updatePollMessage(weekId: string, weekStart: Date, messageTs: string) {
  const { data: attendances } = await supabaseAdmin
    .from('attendance')
    .select('days, users(display_name)')
    .eq('week_id', weekId)

  const attendanceByDay: Record<number, string[]> = {}
  for (const a of (attendances ?? []) as any[]) {
    for (const d of a.days) {
      if (!attendanceByDay[d]) attendanceByDay[d] = []
      attendanceByDay[d].push(a.users.display_name)
    }
  }

  const blocks = buildPollBlocks(weekStart, attendanceByDay, false)
  await slack.chat.update({
    channel: process.env.SLACK_CHANNEL_ID!,
    ts: messageTs,
    blocks: blocks as any,
    text: 'Who is in the office this week?',
  })
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  if (!verifySlackSignature(req, rawBody)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const params = new URLSearchParams(rawBody)
  const payload = JSON.parse(params.get('payload') || '{}')

  if (payload.type === 'block_actions') {
    const slackUserId = payload.user?.id
    const triggerId = payload.trigger_id

    const user = await getOrCreateUser(slackUserId)
    if (!user) return Response.json({ ok: false }, { status: 500 })

    const weekStart = getCurrentWeekStart()
    const weekStartStr = weekStart.toISOString().split('T')[0]

    const { data: week } = await supabaseAdmin
      .from('weeks')
      .select('id, is_closed')
      .eq('week_start', weekStartStr)
      .single()

    if (!week || week.is_closed) return Response.json({})

    const { data: attendance } = await supabaseAdmin
      .from('attendance')
      .select('days')
      .eq('user_id', user.id)
      .eq('week_id', week.id)
      .single()

    const currentDays = attendance?.days ?? []
    const modalView = buildModalView(weekStart, currentDays)

    await slack.views.open({ trigger_id: triggerId, view: modalView as any })
    return Response.json({})
  }

  if (payload.type === 'view_submission') {
    const slackUserId = payload.user?.id
    const values = payload.view?.state?.values

    const user = await getOrCreateUser(slackUserId)
    if (!user) return Response.json({ response_action: 'clear' })

    const weekStart = getCurrentWeekStart()
    const weekStartStr = weekStart.toISOString().split('T')[0]

    const { data: week } = await supabaseAdmin
      .from('weeks')
      .select('id, is_closed, slack_message_ts')
      .eq('week_start', weekStartStr)
      .single()

    if (!week) return Response.json({ response_action: 'clear' })

    if (week.is_closed) {
      return Response.json({
        response_action: 'errors',
        errors: { days_block: 'The poll is closed — Friday 15:00' },
      })
    }

    const selectedOptions = values?.days_block?.days_action?.selected_options ?? []
    const days: number[] = selectedOptions.map((o: any) => Number(o.value))

    await supabaseAdmin.from('attendance').upsert(
      { user_id: user.id, week_id: week.id, days },
      { onConflict: 'user_id,week_id' }
    )

    if (week.slack_message_ts) {
      await updatePollMessage(week.id, weekStart, week.slack_message_ts)
    }

    return Response.json({ response_action: 'clear' })
  }

  return Response.json({})
}
