export type Data = {
  supabaseApiUrl: string
  supabaseServiceRole: string
  supabaseJwtSecret: string
}

export const create = (): Data => ({
  supabaseApiUrl: process.env.SUPABASE_API_URL!,
  supabaseServiceRole: process.env.SUPABASE_SERVICE_ROLE!,
  supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET!,
})
