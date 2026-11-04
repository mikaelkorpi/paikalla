import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { readSession, SESSION_COOKIE } from '@/lib/session'
import { cleanOutfit } from '@/lib/wardrobe'
import { getLevel } from '@/lib/levels'

// Saves the signed-in traveller's outfit. Only unlocked items are kept.
export async function POST(req: NextRequest) {
  const userId = readSession(req.cookies.get(SESSION_COOKIE)?.value)
  if (!userId) return Response.json({ ok: false, error: 'Sign in first' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { data: user } = await supabaseAdmin.from('users').select('total_xp').eq('id', userId).maybeSingle()
  if (!user) return Response.json({ ok: false, error: 'Unknown traveller' }, { status: 404 })

  const outfit = cleanOutfit(getLevel(user.total_xp ?? 0).level, body?.outfit ?? {})
  const { error } = await supabaseAdmin.from('users').update({ outfit }).eq('id', userId)
  if (error) return Response.json({ ok: false, error: 'Could not save right now' }, { status: 500 })
  return Response.json({ ok: true, outfit })
}
