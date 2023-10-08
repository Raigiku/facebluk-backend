export * from './friend-requests-resolver'

export type FriendRequestQL = {
  id: string
  fromUser: FriendRequestQL_U
  toUser: FriendRequestQL_U
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  createdAt: Date
}

export type FriendRequestQL_U = {
  id: string
  name: string
  alias: string
  profilePictureUrl?: string | null
}
