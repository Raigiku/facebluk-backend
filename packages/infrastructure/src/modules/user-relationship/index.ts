export * from './find-one-between-users'
export * from './unfriend'

import { UserRelationship } from '@facebluk/domain'

// postgresql
export namespace PostgreSQL {
  export const eventTableName = 'user_relationship_event'

  export const userRelationshipTableName = 'user_relationship'

  export type UserRelationshipTable = {
    readonly id: string
    readonly created_at: Date
    readonly friend_from_user_id: string | null
    readonly friend_to_user_id: string | null
    readonly friend_status: 'friended' | 'unfriended' | null
    readonly friend_status_updated_at: Date | null
    readonly blocked_from_user_id: string | null
    readonly blocked_to_user_id: string | null
    readonly blocked_status: 'blocked' | 'unblocked' | null
    readonly blocked_status_updated_at: Date | null
  }

  export const userRelationshipTableKey = (k: keyof UserRelationshipTable) => k

  export const userRelationshipTableToAggregate = (
    row: UserRelationshipTable
  ): UserRelationship.Aggregate<UserRelationship.BlockStatus, UserRelationship.FriendStatus> => {
    let friendStatus: UserRelationship.FriendStatus
    if (row.friend_status !== undefined) {
      if (row.friend_status === 'friended')
        friendStatus = {
          tag: 'friended',
          fromUserId: row.friend_from_user_id!,
          toUserId: row.friend_to_user_id!,
          friendedAt: row.friend_status_updated_at!,
        }
      else
        friendStatus = {
          tag: 'unfriended',
          fromUserId: row.friend_from_user_id!,
          toUserId: row.friend_to_user_id!,
          unfriendedAt: row.friend_status_updated_at!,
        }
    } else friendStatus = { tag: 'not-friended' }

    let blockedStatus: UserRelationship.BlockStatus
    if (row.blocked_status !== undefined) {
      if (row.blocked_status === 'blocked')
        blockedStatus = {
          tag: 'blocked',
          fromUserId: row.blocked_from_user_id!,
          toUserId: row.blocked_to_user_id!,
          blockedAt: row.blocked_status_updated_at!,
        }
      else
        blockedStatus = {
          tag: 'unblocked',
          fromUserId: row.blocked_from_user_id!,
          toUserId: row.blocked_to_user_id!,
          unblockedAt: row.blocked_status_updated_at!,
        }
    } else blockedStatus = { tag: 'not-blocked' }

    return {
      aggregate: { id: row.id, createdAt: row.created_at },
      friendStatus,
      blockedStatus,
    }
  }
}

// mongodb
export namespace MongoDB {
  export const collectionName = 'user_relationship'

  export type Document = UserRelationship.Aggregate<UserRelationship.BlockStatus, UserRelationship.FriendStatus>
}