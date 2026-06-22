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

  // Friday soundtrack DM — sent to all who attended this week
  const FRIDAY_TRACKS = [
    { title: 'Rebecca Black — Friday', url: 'https://www.youtube.com/watch?v=kfVsfOSbJY0' },
    { title: 'The Cure — Friday I\'m in Love', url: 'https://www.youtube.com/watch?v=mGgMZpGYiy8' },
    { title: 'Katy Perry — Last Friday Night', url: 'https://www.youtube.com/watch?v=KlyXNRrsk4A' },
    { title: 'Daft Punk — Get Lucky', url: 'https://www.youtube.com/watch?v=5NV6Rdv1a3I' },
    { title: 'MGMT — Electric Feel', url: 'https://www.youtube.com/watch?v=MmZexg8sxyk' },
    { title: 'Pharrell Williams — Happy', url: 'https://www.youtube.com/watch?v=ZbZSe6N_BXs' },
    { title: 'Dua Lipa — Levitating', url: 'https://www.youtube.com/watch?v=TUVcZfQe-Kw' },
    { title: 'Earth, Wind & Fire — September', url: 'https://www.youtube.com/watch?v=Gs069dndIYk' },
    { title: 'Lizzo — Juice', url: 'https://www.youtube.com/watch?v=XaCrQL_8eMY' },
    { title: 'Mark Ronson ft. Bruno Mars — Uptown Funk', url: 'https://www.youtube.com/watch?v=OPf0YbXqDm0' },
    { title: 'Outkast — Hey Ya!', url: 'https://www.youtube.com/watch?v=PWgvGjAhvIw' },
    { title: 'Carly Rae Jepsen — Call Me Maybe', url: 'https://www.youtube.com/watch?v=fWNaR-rxAic' },
    { title: 'Journey — Don\'t Stop Believin\'', url: 'https://www.youtube.com/watch?v=1k8craCGpgs' },
    { title: 'Toto — Africa', url: 'https://www.youtube.com/watch?v=FTQbiNvZqaY' },
    { title: 'A-ha — Take On Me', url: 'https://www.youtube.com/watch?v=djV11Xbc914' },
    { title: 'Cyndi Lauper — Girls Just Want to Have Fun', url: 'https://www.youtube.com/watch?v=PIb6AZdTr-A' },
    { title: 'Queen — Don\'t Stop Me Now', url: 'https://www.youtube.com/watch?v=HgzGwKwLmgM' },
    { title: 'Fleetwood Mac — Go Your Own Way', url: 'https://www.youtube.com/watch?v=6ul-cZyuYq4' },
    { title: 'David Bowie — Let\'s Dance', url: 'https://www.youtube.com/watch?v=N4d7Wp9kKjA' },
    { title: 'Wham! — Wake Me Up Before You Go-Go', url: 'https://www.youtube.com/watch?v=pIIpVODCTFQ' },
    { title: 'Michael Jackson — Don\'t Stop \'Til You Get Enough', url: 'https://www.youtube.com/watch?v=yURRmWtbTbo' },
    { title: 'Prince — Let\'s Go Crazy', url: 'https://www.youtube.com/watch?v=aXJhDltzYVQ' },
    { title: 'Talking Heads — Once in a Lifetime', url: 'https://www.youtube.com/watch?v=5IsSpAOD6K8' },
    { title: 'LCD Soundsystem — All My Friends', url: 'https://www.youtube.com/watch?v=cCCP9zECzJ4' },
    { title: 'Disclosure ft. Sam Smith — Latch', url: 'https://www.youtube.com/watch?v=kWPMwSYMnrk' },
    { title: 'Childish Gambino — Redbone', url: 'https://www.youtube.com/watch?v=Kp7eSUU9oy8' },
    { title: 'Frank Ocean — Nights', url: 'https://www.youtube.com/watch?v=gHn2HCkVpwY' },
    { title: 'Tyler, the Creator — See You Again', url: 'https://www.youtube.com/watch?v=k2qgadSvNyU' },
    { title: 'Mac DeMarco — Chamber of Reflection', url: 'https://www.youtube.com/watch?v=TGDjHhQJdxc' },
    { title: 'Tame Impala — Let It Happen', url: 'https://www.youtube.com/watch?v=pFptt7Cargc' },
    { title: 'Arcade Fire — Wake Up', url: 'https://www.youtube.com/watch?v=D6okBGJNJgQ' },
    { title: 'Vampire Weekend — A-Punk', url: 'https://www.youtube.com/watch?v=_XC2xBpFPkA' },
    { title: 'The Strokes — Last Nite', url: 'https://www.youtube.com/watch?v=TOypSnKFHrE' },
    { title: 'Arctic Monkeys — R U Mine?', url: 'https://www.youtube.com/watch?v=tmeqJnBFdUA' },
    { title: 'Radiohead — Karma Police', url: 'https://www.youtube.com/watch?v=1uYWYWPc9HU' },
    { title: 'Blur — Song 2', url: 'https://www.youtube.com/watch?v=SSbBvKaM6sk' },
    { title: 'Gorillaz — Feel Good Inc.', url: 'https://www.youtube.com/watch?v=HyHNuVaZJ-k' },
    { title: 'Massive Attack — Teardrop', url: 'https://www.youtube.com/watch?v=u7K72X4eo_s' },
    { title: 'Air — La Femme D\'Argent', url: 'https://www.youtube.com/watch?v=ISjivbsT8PQ' },
    { title: 'Bonobo — Kiara', url: 'https://www.youtube.com/watch?v=oT3mTtCgTz8' },
    { title: 'Four Tet — Lush', url: 'https://www.youtube.com/watch?v=VTWguvnOHiw' },
    { title: 'Jamie xx — Loud Places', url: 'https://www.youtube.com/watch?v=6-BxTUfVCVU' },
    { title: 'Caribou — Can\'t Do Without You', url: 'https://www.youtube.com/watch?v=KCyOEqZUHco' },
    { title: 'Hot Chip — Over and Over', url: 'https://www.youtube.com/watch?v=bBSMEQaUMco' },
    { title: 'Phoenix — 1901', url: 'https://www.youtube.com/watch?v=qvkTBCnQ_-g' },
    { title: 'Justice — D.A.N.C.E.', url: 'https://www.youtube.com/watch?v=sAhbMZ_OSeU' },
    { title: 'Daft Punk — One More Time', url: 'https://www.youtube.com/watch?v=FGBhQbmPwH8' },
    { title: 'Chemical Brothers — Hey Boy Hey Girl', url: 'https://www.youtube.com/watch?v=8BkVBBEjqsc' },
    { title: 'Fatboy Slim — Praise You', url: 'https://www.youtube.com/watch?v=ruAi4VBoBSM' },
    { title: 'Underworld — Born Slippy', url: 'https://www.youtube.com/watch?v=6ywbSzcsaM0' },
  ]

  const track = FRIDAY_TRACKS[Math.floor(Math.random() * FRIDAY_TRACKS.length)]

  // Send Friday soundtrack to all attendees this week
  const { data: allAttendances } = await supabaseAdmin
    .from('attendance')
    .select('user_id, users(slack_user_id)')
    .eq('week_id', week.id)

  for (const a of (allAttendances ?? []) as any[]) {
    if (!a.users?.slack_user_id) continue
    const dm = await slack.conversations.open({ users: a.users.slack_user_id })
    if ((dm.channel as any)?.id) {
      await slack.chat.postMessage({
        channel: (dm.channel as any).id,
        text: `🎵 *Friday Soundtrack* — ${track.title}\n${track.url}\n\nHave a great weekend. See you next week.`,
      })
    }
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
