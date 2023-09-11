import { FriendedUserEvent, UnfriendedUserEvent } from './events'
import { Aggregate, BlockStatus, FriendStatus } from './models'

// mutations
export type FnFriend = (isNew: boolean, event: FriendedUserEvent) => Promise<void>
export type FnUnfriend = (event: UnfriendedUserEvent) => Promise<void>

// queries
export type FnFindOneBetweenUsers = (
  userAId: string,
  userBId: string
) => Promise<Aggregate<BlockStatus, FriendStatus> | undefined>
