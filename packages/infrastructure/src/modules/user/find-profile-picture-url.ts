import { User } from '@facebluk/domain'
import { SupabaseClient } from '@supabase/supabase-js'
import { bucketNames } from '.'

export const findProfilePictureUrl =
  (supabase: SupabaseClient): User.FnFindProfilePictureUrl =>
  (userId: string) => {
    const { data } = supabase.storage
      .from(bucketNames.userProfilePicture)
      .getPublicUrl(`user-profile-picture-${userId}`)
    return data.publicUrl
  }
