export * as Mutations from './mutations'
export * as Queries from './queries'

import { FriendRequest } from '@facebluk/domain'

// postgresql
export namespace PostgreSQL {
  export const eventTableName = 'friend_request_event'

  export const friendRequestTableName = 'friend_request'

  export type FriendRequestTable = {
    readonly id: string
    readonly created_at: Date
    readonly from_user_id: string
    readonly to_user_id: string
    readonly accepted_at: Date | null
    readonly cancelled_at: Date | null
    readonly rejected_at: Date | null
  }

  export const friendRequestTableKey = (k: keyof FriendRequestTable) => k

  export const friendRequestTableToAggregate = (
    row: FriendRequestTable
  ): FriendRequest.Aggregate<FriendRequest.AggregateStatus> => {
    let friendRequestStatus: FriendRequest.AggregateStatus
    if (row.accepted_at !== null)
      friendRequestStatus = { tag: 'accepted', acceptedAt: row.accepted_at }
    else if (row.cancelled_at !== null)
      friendRequestStatus = { tag: 'cancelled', cancelledAt: row.cancelled_at }
    else if (row.rejected_at !== null)
      friendRequestStatus = { tag: 'rejected', rejectedAt: row.rejected_at }
    else friendRequestStatus = { tag: 'pending' }

    return {
      aggregate: { id: row.id, createdAt: row.created_at },
      fromUserId: row.from_user_id,
      toUserId: row.to_user_id,
      status: friendRequestStatus,
    }
  }
}

// mongodb
export namespace MongoDB {
  export const collectionName = 'friend_request'

  export type Document = Omit<
    FriendRequest.Aggregate<FriendRequest.AggregateStatus>,
    'fromUserId' | 'toUserId'
  > & {
    readonly fromUser: {
      readonly id: string
      readonly name: string
      readonly alias: string
      readonly profilePictureUrl?: string | null
    }
    readonly toUser: {
      readonly id: string
      readonly name: string
      readonly alias: string
      readonly profilePictureUrl?: string | null
    }
  }
}