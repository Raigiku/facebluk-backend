import { User } from '@facebluk/domain'
import { SupabaseClient } from '@supabase/supabase-js'
import { bucketNames } from '.'

export const uploadProfilePicture =
  (supabase: SupabaseClient): User.FnUploadProfilePicture =>
  async (userId: string, bytes: ArrayBuffer) => {
    const { error } = await supabase.storage
      .from(bucketNames.userProfilePicture)
      .upload(`user-profile-picture-${userId}`, bytes, { upsert: true })
    if (error !== null) throw error
  }
