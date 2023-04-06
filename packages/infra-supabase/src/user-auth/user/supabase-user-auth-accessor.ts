import { Logger, UA } from '@facebluk/domain'
import { SupabaseClient } from '@supabase/supabase-js'

export const getById =
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
      registeredAt: data.user.user_metadata.registeredAt,
    }
  }

export const markAsRegistered =
  (
    supabase: SupabaseClient,
    log: Logger.FnLog,
    requestId: string
  ): UA.User.FnMarkUserAsRegistered =>
  async (id: string, registeredAt: Date) => {
    const { error } = await supabase.auth.admin.updateUserById(id, {
      user_metadata: { registeredAt },
    })
    if (error !== null) {
      log('error', requestId, error.message)
      throw error
    }
  }
