import { createHash } from 'crypto'

export const ADMIN_COOKIE = 'paikalla_admin'

export function adminToken(): string | null {
  const pw = process.env.ADMIN_PASSWORD
  if (!pw) return null
  return createHash('sha256').update(`${pw}:paikalla-admin`).digest('hex')
}

export function isAdminCookie(value: string | undefined | null): boolean {
  const token = adminToken()
  return !!token && !!value && value === token
}
