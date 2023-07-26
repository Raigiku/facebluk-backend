import { ES } from '@facebluk/domain'
export * from './mutations'
export * from './queries'

export const eventTableName = 'friend_request_event'
export const friendRequestTableName = 'friend_request'

export type FriendRequestTable = {
  readonly id: string
  readonly version: bigint
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
): ES.FriendRequest.Aggregate<ES.FriendRequest.AggregateStatus> => {
  let friendRequestStatus: ES.FriendRequest.AggregateStatus
  if (row.accepted_at !== null)
    friendRequestStatus = { tag: 'accepted', acceptedAt: row.accepted_at }
  else if (row.cancelled_at !== null)
    friendRequestStatus = { tag: 'cancelled', cancelledAt: row.cancelled_at }
  else if (row.rejected_at !== null)
    friendRequestStatus = { tag: 'rejected', rejectedAt: row.rejected_at }
  else friendRequestStatus = { tag: 'pending' }

  return {
    aggregate: { id: row.id, version: row.version, createdAt: row.created_at },
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    status: friendRequestStatus,
  }
}
