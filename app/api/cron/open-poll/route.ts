import { NextRequest } from 'next/server'
import { getCurrentWeekStart } from '@/lib/week'
import { openPollForWeek } from '@/lib/openPoll'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  const result = await openPollForWeek(getCurrentWeekStart())
  return Response.json(result, { status: result.ok ? 200 : 500 })
}
