import { FnLog, User } from '@facebluk/domain'
import { SupabaseClient } from '@supabase/supabase-js'

export const findAuthMetadata =
  (supabase: SupabaseClient, log: FnLog, requestId: string): User.AuthQueries.FindAuthMetadata =>
  async (id: string) => {
    const { data, error } = await supabase.auth.admin.getUserById(id)
    if (error !== null) {
      log('error', requestId, error.message)
      return undefined
    }
    if (data.user === null) return undefined
    return {
      userId: id,
      registeredAt: data.user.user_metadata.registeredAt,
    }
  }
