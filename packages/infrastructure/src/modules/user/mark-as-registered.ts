import { Logger, User } from '@facebluk/domain'
import { SupabaseClient } from '@supabase/supabase-js'

export const markAsRegistered =
  (supabase: SupabaseClient, log: Logger.FnLog, requestId: string): User.FnMarkAsRegistered =>
  async (id: string, registeredAt: Date) => {
    const { error } = await supabase.auth.admin.updateUserById(id, {
      user_metadata: { registeredAt },
    })
    if (error !== null) {
      log('error', requestId, error.message)
      throw error
    }
  }
