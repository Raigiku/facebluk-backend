import { Logger, UA } from '@facebluk/domain'
import { SupabaseClient } from '@supabase/supabase-js'

export const getUserById =
  (supabase: SupabaseClient, log: Logger.FnLog, requestId: string): UA.User.FnGetById =>
  async (id: string) => {
    const { data, error } = await supabase.auth.admin.getUserById(id)
    if (error !== null) {
      log('error', requestId, error.message)
      return undefined
    }
    if (data.user === null) return undefined
    return {
      id: data.user.id,
    }
  }
