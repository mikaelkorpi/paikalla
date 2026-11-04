import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { SESSION_COOKIE, STATE_COOKIE, appUrl, sessionValue } from '@/lib/session'

function back(path: string, cookies: string[] = []) {
  const headers = new Headers({ Location: `${appUrl()}${path}` })
  for (const c of cookies) headers.append('Set-Cookie', c)
  return new Response(null, { status: 302, headers })
}

// Finishes "Sign in with Slack": swaps the code for a token, reads the Slack user id
// and signs in the matching Paikalla traveller.
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const clearState = `${STATE_COOKIE}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`

  if (!code || !state || state !== req.cookies.get(STATE_COOKIE)?.value) {
    return back('/wardrobe?error=state', [clearState])
  }

  const tokenRes = await fetch('https://slack.com/api/openid.connect.token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
      code,
      redirect_uri: `${appUrl()}/api/auth/slack/callback`,
    }),
  }).then(r => r.json())
  if (!tokenRes.ok || !tokenRes.access_token) return back('/wardrobe?error=token', [clearState])

  const info = await fetch('https://slack.com/api/openid.connect.userInfo', {
    headers: { Authorization: `Bearer ${tokenRes.access_token}` },
  }).then(r => r.json())
  const slackUserId: string | undefined = info?.['https://slack.com/user_id'] ?? info?.sub
  if (!info?.ok || !slackUserId) return back('/wardrobe?error=userinfo', [clearState])

  const team = process.env.SLACK_TEAM_ID
  if (team && info['https://slack.com/team_id'] !== team) return back('/wardrobe?error=team', [clearState])

  const { data: user } = await supabaseAdmin.from('users').select('id').eq('slack_user_id', slackUserId).maybeSingle()
  if (!user) return back('/wardrobe?error=unknown', [clearState])

  return back('/wardrobe', [
    clearState,
    `${SESSION_COOKIE}=${sessionValue(user.id)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 180}`,
  ])
}
