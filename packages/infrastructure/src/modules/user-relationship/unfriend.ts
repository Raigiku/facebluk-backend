import { UserRelationship } from '@facebluk/domain'
import { PoolClient } from 'pg'
import { eventTableName, userRelationshipTableKey, userRelationshipTableName } from '.'
import { registerEvent } from '../event'
import { Common } from '..'

export const unfriend =
  (pgClient: PoolClient): UserRelationship.FnUnfriend =>
  async (event: UserRelationship.UnfriendedUserEvent) => {
    await Common.pgTransaction(pgClient, async () => {
      await _unfriend(pgClient, event)
      await registerEvent(pgClient, eventTableName, event)
    })
  }

export const _unfriend = async (
  pgClient: PoolClient,
  event: UserRelationship.UnfriendedUserEvent
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
