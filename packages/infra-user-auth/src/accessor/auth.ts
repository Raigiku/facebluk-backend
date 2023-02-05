import { UA } from '@facebluk/domain'
import { SupabaseClient } from '@supabase/supabase-js'

export const getUserById =
  (supabase: SupabaseClient): UA.User.FnGetById =>
  async (id: string) => {
    const { data, error } = await supabase.auth.admin.getUserById(id)
    if (data.user === null || error !== null) return undefined
    return {
      id: data.user.id,
    }
  }
