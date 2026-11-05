import { supabaseAdmin } from './supabase'
import type { Earned, Outfit } from './wardrobe'

// Event xp types each traveller has earned (xp_events.type starting with "event_").
// Returns {} if the query fails, so pages keep working without event gear and badges.
export async function loadEarned(ids?: string[]): Promise<Record<string, Earned>> {
  let q = supabaseAdmin.from('xp_events').select('user_id, type').like('type', 'event_%')
  if (ids) q = q.in('user_id', ids)
  const { data, error } = await q
  if (error || !data) return {}
  const map: Record<string, Earned> = {}
  for (const row of data as { user_id: string; type: string }[]) {
    const list = (map[row.user_id] ??= [])
    if (!list.includes(row.type)) list.push(row.type)
  }
  return map
}

// Saved outfits by user id, with each traveller's earned event types attached as outfit.earned.
// Returns {} if the outfit column is missing or the query fails,
// so pages keep working and avatars fall back to their default look.
export async function loadOutfits(ids?: string[]): Promise<Record<string, Outfit>> {
  let q = supabaseAdmin.from('users').select('id, outfit')
  if (ids) q = q.in('id', ids)
  const [{ data, error }, earned] = await Promise.all([q, loadEarned(ids)])
  const map: Record<string, Outfit> = {}
  if (!error && data) {
    for (const row of data as { id: string; outfit: Outfit | null }[]) {
      if (row.outfit) map[row.id] = { ...row.outfit }
    }
  }
  for (const [id, list] of Object.entries(earned)) map[id] = { ...(map[id] ?? {}), earned: list }
  return map
}
