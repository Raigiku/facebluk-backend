import { FriendedUserEvent, UnfriendedUserEvent } from './events'
import { Aggregate, BlockStatus, FriendStatus } from './models'

export namespace DbQueries {
  export type FindOneBetweenUsers = (
    userAId: string,
    userBId: string
  ) => Promise<Aggregate<BlockStatus, FriendStatus> | undefined>
}

export namespace Mutations {
  export type Friend = (isNew: boolean, event: FriendedUserEvent) => Promise<void>
  export type Unfriend = (event: UnfriendedUserEvent, persistEvent: boolean) => Promise<void>
}
