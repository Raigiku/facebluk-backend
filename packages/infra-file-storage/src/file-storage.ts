import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { User } from './accessor'
import * as Config from './config'
export * as Accessor from './accessor'
export { Config, SupabaseClient }

export const fileBucketNames = [...Object.values(User.bucketNames)]

export const createSupabaseClient = (config: Config.Data) =>
  createClient(config.supabaseApiUrl, config.supabaseServiceRole)
