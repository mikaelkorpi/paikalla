import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

// Signed-in traveller, set after "Sign in with Slack". The cookie holds the users.id plus an HMAC.
export const SESSION_COOKIE = 'paikalla_user'
export const STATE_COOKIE = 'paikalla_oauth_state'

function secret(): string | null {
  return process.env.SLACK_CLIENT_SECRET || null
}

function sign(value: string): string {
  return createHmac('sha256', secret()!).update(`${value}:paikalla-session`).digest('hex')
}

export function sessionValue(userId: string): string {
  return `${userId}.${sign(userId)}`
}

export function readSession(value: string | undefined | null): string | null {
  if (!value || !secret()) return null
  const i = value.lastIndexOf('.')
  if (i <= 0) return null
  const userId = value.slice(0, i)
  const given = Buffer.from(value.slice(i + 1))
  const expected = Buffer.from(sign(userId))
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null
  return userId
}

export async function currentUserId(): Promise<string | null> {
  const store = await cookies()
  return readSession(store.get(SESSION_COOKIE)?.value)
}

export function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '')
}
