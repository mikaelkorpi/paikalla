import { createClient, SupabaseClient } from '@supabase/supabase-js'

function makeClient(url: string | undefined, key: string | undefined): SupabaseClient {
  if (!url || !key) {
    // Return a no-op client during build time when env vars are not set
    return createClient('https://build-placeholder.supabase.co', 'build-placeholder-key')
  }
  return createClient(url, key)
}

export const supabase = makeClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export const supabaseAdmin = makeClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
