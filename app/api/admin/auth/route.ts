import { NextRequest } from 'next/server'
import { ADMIN_COOKIE, adminToken } from '@/lib/admin'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))

  if (body.action === 'logout') {
    const res = Response.json({ ok: true })
    res.headers.set('Set-Cookie', `${ADMIN_COOKIE}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`)
    return res
  }

  const token = adminToken()
  if (!token) return Response.json({ ok: false, error: 'ADMIN_PASSWORD is not set' }, { status: 500 })
  if (body.password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ ok: false, error: 'Wrong password' }, { status: 401 })
  }

  const res = Response.json({ ok: true })
  res.headers.set(
    'Set-Cookie',
    `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`
  )
  return res
}
