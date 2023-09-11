import { File } from '@facebluk/domain'
import { SupabaseClient } from '@supabase/supabase-js'

export const findFileUrl =
  (supabase: SupabaseClient): File.FnFindFileUrl =>
  (bucket: string, path: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }
