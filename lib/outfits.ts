import { supabaseAdmin } from './supabase'
import type { Outfit } from './wardrobe'

// Saved outfits by user id. Returns {} if the outfit column is missing or the query fails,
// so pages keep working and avatars fall back to their default look.
export async function loadOutfits(ids?: string[]): Promise<Record<string, Outfit>> {
  let q = supabaseAdmin.from('users').select('id, outfit')
  if (ids) q = q.in('id', ids)
  const { data, error } = await q
  if (error || !data) return {}
  const map: Record<string, Outfit> = {}
  for (const row of data as { id: string; outfit: Outfit | null }[]) {
    if (row.outfit) map[row.id] = row.outfit
  }
  return map
}
