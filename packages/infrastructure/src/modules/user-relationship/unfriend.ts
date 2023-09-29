import { UserRelationship } from '@facebluk/domain'
import { PoolClient } from 'pg'
import { eventTableName, userRelationshipTableKey, userRelationshipTableName } from '.'
import { insertEvent } from '../event'
import { Common } from '..'

export const unfriend =
  (pgClient: PoolClient): UserRelationship.Mutations.Unfriend =>
  async (event, persistEvent) => {
    if (persistEvent)
      await Common.pgTransaction(pgClient, async () => {
        await updateUserRelationshipTable(pgClient, event)
        await insertEvent(pgClient, eventTableName, event)
      })
  }

const updateUserRelationshipTable = async (
  pgClient: PoolClient,
  event: UserRelationship.UnfriendedUserEvent
) => {
  await pgClient.query(
    `
      UPDATE ${userRelationshipTableName}
      SET 
        ${userRelationshipTableKey('friend_from_user_id')} = $1,
        ${userRelationshipTableKey('friend_to_user_id')} = $2,
        ${userRelationshipTableKey('friend_status')} = $3,
        ${userRelationshipTableKey('friend_status_updated_at')} = $4
      WHERE ${userRelationshipTableKey('id')} = $5
    `,
    [
      event.payload.fromUserId,
      event.payload.toUserId,
      'unfriended',
      event.data.createdAt,
      event.data.aggregateId,
    ]
  )
}
