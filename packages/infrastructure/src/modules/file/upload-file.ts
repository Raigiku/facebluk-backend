import { File } from '@facebluk/domain'
import { SupabaseClient } from '@supabase/supabase-js'

export const uploadFile =
  (supabase: SupabaseClient): File.Mutations.Upload =>
  async (bucket: string, path: string, bytes: ArrayBuffer) => {
    const { error } = await supabase.storage.from(bucket).upload(path, bytes, { upsert: true })
    if (error !== null) throw error
  }
