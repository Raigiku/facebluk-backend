import { createClient, SupabaseClient } from '@supabase/supabase-js'
import * as Config from './config'
import * as FileStorage from './file-storage'
import * as UserAuth from './user-auth'

const createSupabaseClient = (config: Config.Data) =>
  createClient(config.supabaseApiUrl, config.supabaseServiceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

export { Config, UserAuth, FileStorage, createSupabaseClient, SupabaseClient }
