import { FriendRequest, UserRelationship } from '@facebluk/domain'
import { PoolClient } from 'pg'
import { insertEvent } from '../../event'
import { Common } from '../..'
import { PostgreSQL as FriendRequestInfra } from '..'
import { PostgreSQL as UserRelationshipInfra } from '../../user-relationship'

export const accept =
  (pgClient: PoolClient): FriendRequest.Mutations.Accept =>
    async (
      friendRequestEvent,
      persistEvents,
      userRelationshipEvent,
      didCreateNewUserRelationship
    ) => {
      if (persistEvents) {
        await Common.pgTransaction(pgClient, async () => {
          await updateFriendRequestTable(pgClient, friendRequestEvent)
          await insertEvent(pgClient, FriendRequestInfra.eventTableName, friendRequestEvent)

          if (didCreateNewUserRelationship)
            await insertInUserRelationshipTable(pgClient, userRelationshipEvent)
          else await updateUserRelationshipTable(pgClient, userRelationshipEvent)

          await insertEvent(pgClient, UserRelationshipInfra.eventTableName, userRelationshipEvent)
        })
      }
    }

export const updateFriendRequestTable = async (
  pgClient: PoolClient,
  event: FriendRequest.AcceptedEvent
) => {
  await pgClient.query(
    `
      UPDATE ${FriendRequestInfra.friendRequestTableName}
      SET 
        ${FriendRequestInfra.friendRequestTableKey('accepted_at')} = $1
      WHERE ${FriendRequestInfra.friendRequestTableKey('id')} = $2
    `,
    [event.data.createdAt, event.data.aggregateId]
  )
}

export const updateUserRelationshipTable = async (
  pgClient: PoolClient,
  event: UserRelationship.FriendedUserEvent
) => {
  await pgClient.query(
    `
      UPDATE ${UserRelationshipInfra.userRelationshipTableName}
      SET 
        ${UserRelationshipInfra.userRelationshipTableKey('friend_from_user_id')} = $1,
        ${UserRelationshipInfra.userRelationshipTableKey('friend_to_user_id')} = $2,
        ${UserRelationshipInfra.userRelationshipTableKey('friend_status')} = $3,
        ${UserRelationshipInfra.userRelationshipTableKey('friend_status_updated_at')} = $4
      WHERE ${UserRelationshipInfra.userRelationshipTableKey('id')} = $5
    `,
    [
      event.payload.fromUserId,
      event.payload.toUserId,
      'friended',
      event.data.createdAt,
      event.data.aggregateId,
    ]
  )
}

export const insertInUserRelationshipTable = async (
  pgClient: PoolClient,
  event: UserRelationship.FriendedUserEvent
) => {
  await pgClient.query(
    `
      INSERT INTO ${UserRelationshipInfra.userRelationshipTableName} (
        ${UserRelationshipInfra.userRelationshipTableKey('id')},
        ${UserRelationshipInfra.userRelationshipTableKey('created_at')},
        ${UserRelationshipInfra.userRelationshipTableKey('friend_from_user_id')},
        ${UserRelationshipInfra.userRelationshipTableKey('friend_to_user_id')},
        ${UserRelationshipInfra.userRelationshipTableKey('friend_status')},
        ${UserRelationshipInfra.userRelationshipTableKey('friend_status_updated_at')}
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      event.data.aggregateId,
      event.data.createdAt,
      event.payload.fromUserId,
      event.payload.toUserId,
      'friended',
      event.data.createdAt,
    ]
  )
}
