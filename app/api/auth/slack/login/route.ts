import { randomBytes } from 'crypto'
import { STATE_COOKIE, appUrl } from '@/lib/session'

// Starts "Sign in with Slack" (OpenID Connect).
export async function GET() {
  const clientId = process.env.SLACK_CLIENT_ID
  if (!clientId || !process.env.SLACK_CLIENT_SECRET) {
    return new Response('Sign in with Slack is not configured yet (SLACK_CLIENT_ID / SLACK_CLIENT_SECRET).', { status: 500 })
  }
  const state = randomBytes(16).toString('hex')
  const params = new URLSearchParams({
    response_type: 'code',
    scope: 'openid profile',
    client_id: clientId,
    redirect_uri: `${appUrl()}/api/auth/slack/callback`,
    state,
    nonce: randomBytes(16).toString('hex'),
  })
  const team = process.env.SLACK_TEAM_ID
  if (team) params.set('team', team)
  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://slack.com/openid/connect/authorize?${params}`,
      'Set-Cookie': `${STATE_COOKIE}=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  })
}
