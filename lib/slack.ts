import { WebClient } from '@slack/web-api'
import { createHmac } from 'crypto'

export const slack = new WebClient(process.env.SLACK_BOT_TOKEN)

export function verifySlackSignature(req: Request, body: string): boolean {
  const timestamp = req.headers.get('x-slack-request-timestamp')
  const signature = req.headers.get('x-slack-signature')
  if (!timestamp || !signature) return false
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false
  const sigBase = `v0:${timestamp}:${body}`
  const hmac = createHmac('sha256', process.env.SLACK_SIGNING_SECRET!)
    .update(sigBase)
    .digest('hex')
  return `v0=${hmac}` === signature
}
