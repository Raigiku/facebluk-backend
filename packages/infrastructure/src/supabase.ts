import { SupabaseClient, createClient as createClientSb } from '@supabase/supabase-js'

export type Config = {
  supabaseApiUrl: string
  supabaseServiceRole: string
  supabaseJwtSecret: string
}

export const createConfig = (): Config => ({
  supabaseApiUrl: process.env.SUPABASE_API_URL!,
  supabaseServiceRole: process.env.SUPABASE_SERVICE_ROLE!,
  supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET!,
})

export const createClient = (config: Config) =>
  createClientSb(config.supabaseApiUrl, config.supabaseServiceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

export { SupabaseClient }

