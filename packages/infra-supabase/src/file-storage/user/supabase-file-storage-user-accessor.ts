import { FS } from '@facebluk/domain'
import { SupabaseClient } from '@supabase/supabase-js'

export const bucketNames = {
  userProfilePicture: 'user-profile-picture',
}

export const uploadProfilePicture =
  (supabase: SupabaseClient): FS.User.FnUploadProfilePicture =>
  async (userId: string, bytes: ArrayBuffer) => {
    const { data, error } = await supabase.storage
      .from(bucketNames.userProfilePicture)
      .upload(`user-profile-picture-${userId}`, bytes)
    if (error !== null) throw error
    return data.path
  }

export const getProfilePictureUrl =
  (supabase: SupabaseClient): FS.User.FnGetProfilePictureUrl =>
  (userId: string) => {
    const { data } = supabase.storage
      .from(bucketNames.userProfilePicture)
      .getPublicUrl(`user-profile-picture-${userId}`)
    return data.publicUrl
  }
