import { createClient, SupabaseClient } from '@supabase/supabase-js'

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const rawSupabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined

// Normalize URL: remove any trailing slashes or /rest/v1 path if accidentally appended
const supabaseUrl = rawSupabaseUrl
  ?.trim()
  .replace(/\/rest\/v1\/?$/i, '')
  .replace(/\/+$/, '')

const supabaseKey = rawSupabaseKey?.trim()

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseKey !== 'your-supabase-anon-key' &&
    supabaseUrl.startsWith('https://')
)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null

export function getSupabaseConfigStatus(): {
  configured: boolean
  urlConfigured: boolean
  keyConfigured: boolean
} {
  return {
    configured: isSupabaseConfigured,
    urlConfigured: Boolean(supabaseUrl && supabaseUrl.startsWith('https://')),
    keyConfigured: Boolean(supabaseKey && supabaseKey.length > 10),
  }
}
