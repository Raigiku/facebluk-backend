import { createClient, SupabaseClient } from '@supabase/supabase-js'
import * as Config from './config'
export * as Accessor from './accessor'
export * from './model'
export { Config, createSupabaseClient, SupabaseClient }

const createSupabaseClient = (config: Config.Data) =>
  createClient(config.supabaseApiUrl, config.supabaseServiceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
