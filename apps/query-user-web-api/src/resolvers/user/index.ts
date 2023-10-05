export * from './user-resolver'
export * from './users-resolver'

export type UserQL = {
  id: string
  name: string
  alias: string
  profilePictureUrl?: string
  relationshipWithUser: {
    isFriend: boolean
    pendingFriendRequest?: {
      id: string
      isRequestUserReceiver: boolean
    }
  }
}
