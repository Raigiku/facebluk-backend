export * from './posts-resolver'

export type PostQL = {
  id: string
  description: string
  user: {
    id: string
    name: string
    alias: string
    profilePictureUrl?: string
  }
}
