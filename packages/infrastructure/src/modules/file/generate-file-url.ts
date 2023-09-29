import { File } from '@facebluk/domain'
import { SupabaseClient } from '@supabase/supabase-js'

export const generateFileUrl =
  (supabase: SupabaseClient): File.AuthQueries.GenerateFileUrl =>
  (bucket: string, path: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }
