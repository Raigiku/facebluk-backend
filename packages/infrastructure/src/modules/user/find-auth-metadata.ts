import { Logger, User } from '@facebluk/domain'
import { SupabaseClient } from '@supabase/supabase-js'

export const findAuthMetadata =
  (supabase: SupabaseClient, log: Logger.FnLog, requestId: string): User.FnFindAuthMetadata =>
  async (id: string) => {
    const { data, error } = await supabase.auth.admin.getUserById(id)
    if (error !== null) {
      log('error', requestId, error.message)
      return undefined
    }
    if (data.user === null) return undefined
    return {
      id,
      registeredAt: data.user.user_metadata.registeredAt,
    }
  }
