import { ES } from '@facebluk/domain'
import { PoolClient } from 'pg'
import { eventTableName, userRelationshipTableKey, userRelationshipTableName } from '.'
import { registerEvent } from '../../common'

export const friend =
  (pgClient: PoolClient): ES.UserRelationship.FnFriend =>
  async (isNew: boolean, event: ES.UserRelationship.FriendedUserEvent) => {
    await _friend(pgClient, isNew, event)
    await registerEvent(pgClient, eventTableName, event)
  }

export const _friend = async (
  pgClient: PoolClient,
  isNew: boolean,
  event: ES.UserRelationship.FriendedUserEvent
) => {
  if (isNew)
    await pgClient.query(
      `
        INSERT INTO ${userRelationshipTableName} (
          ${userRelationshipTableKey('id')},
          ${userRelationshipTableKey('version')},
          ${userRelationshipTableKey('created_at')},
          ${userRelationshipTableKey('friend_from_user_id')},
          ${userRelationshipTableKey('friend_to_user_id')},
          ${userRelationshipTableKey('friend_status')},
          ${userRelationshipTableKey('friend_status_updated_at')}
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        event.data.aggregateId,
        event.data.aggregateVersion,
        event.data.createdAt,
        event.payload.fromUserId,
        event.payload.toUserId,
        'friended',
        event.data.createdAt,
      ]
    )
  else
    await pgClient.query(
      `
        UPDATE ${userRelationshipTableName}
        SET 
          ${userRelationshipTableKey('version')} = $1,
          ${userRelationshipTableKey('friend_from_user_id')} = $2,
          ${userRelationshipTableKey('friend_to_user_id')} = $3,
          ${userRelationshipTableKey('friend_status')} = $4,
          ${userRelationshipTableKey('friend_status_updated_at')} = $5
        WHERE ${userRelationshipTableKey('id')} = $6
      `,
      [
        event.data.aggregateVersion,
        event.payload.fromUserId,
        event.payload.toUserId,
        'friended',
        event.data.createdAt,
        event.data.aggregateId,
      ]
    )
}

export const unfriend =
  (pgClient: PoolClient): ES.UserRelationship.FnUnfriend =>
  async (event: ES.UserRelationship.UnfriendedUserEvent) => {
    await _unfriend(pgClient, event)
    await registerEvent(pgClient, eventTableName, event)
  }

export const _unfriend = async (
  pgClient: PoolClient,
  event: ES.UserRelationship.UnfriendedUserEvent
) => {
  await pgClient.query(
    `
      UPDATE ${userRelationshipTableName}
      SET 
        ${userRelationshipTableKey('version')} = $1,
        ${userRelationshipTableKey('friend_from_user_id')} = $2,
        ${userRelationshipTableKey('friend_to_user_id')} = $3,
        ${userRelationshipTableKey('friend_status')} = $4,
        ${userRelationshipTableKey('friend_status_updated_at')} = $5
      WHERE ${userRelationshipTableKey('id')} = $6
    `,
    [
      event.data.aggregateVersion,
      event.payload.fromUserId,
      event.payload.toUserId,
      'unfriended',
      event.data.createdAt,
      event.data.aggregateId,
    ]
  )
}
