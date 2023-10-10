export * as Queries from './queries'
export * as Mutations from './mutations'

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

    return {
      aggregate: { id: row.id, createdAt: row.created_at },
      friendStatus,
      blockedStatus: {
        tag: 'not-blocked'
      },
    }
  }
}

// mongodb
export namespace MongoDB {
  export const collectionName = 'user_relationship'

  export type Document = UserRelationship.Aggregate<UserRelationship.BlockStatus, UserRelationship.FriendStatus>
}