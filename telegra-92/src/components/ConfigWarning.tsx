import { supabaseConfigured } from '../lib/supabase'

/** Baner offline — szkielet działa bez Supabase, ale gra wymaga .env.local. */
export default function ConfigWarning() {
  if (supabaseConfigured) return null
  return (
    <div className="rounded-lg border border-wata/40 bg-wata/10 px-4 py-2 text-sm text-wata">
      Brak konfiguracji Supabase — skopiuj <code>.env.example</code> do{' '}
      <code>.env.local</code>, żeby telefony mogły dołączać.
    </div>
  )
}
