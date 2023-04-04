export type AuthJwt = {
  aud: string
  exp: number
  sub: string
  email: string
  phone: string
  app_metadata: {
    provider: string
    providers: string[]
  }
  user_metadata: {
    avatar_url: string
    email: string
    email_verified: boolean
    full_name: string
    iss: string
    name: string
    picture: string
    provider_id: string
    sub: string
    registeredAt?: Date
  }
  role: string
  aal: string
  amr: {
    method: string
    timestamp: number
  }[]
  session_id: string
}
