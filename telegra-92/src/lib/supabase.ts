import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** True, gdy w .env.local są prawdziwe dane projektu (nie placeholdery). */
export const supabaseConfigured = Boolean(
  url && anonKey && !url.includes('TWOJ-PROJEKT') && !anonKey.includes('TWOJ-KLUCZ'),
)

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!supabaseConfigured) {
    throw new Error('Supabase nie jest skonfigurowany — skopiuj .env.example do .env.local')
  }
  client ??= createClient(url!, anonKey!)
  return client
}
