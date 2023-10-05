import { UserRelationship } from '@facebluk/domain'
import { PoolClient } from 'pg'
import { PostgreSQL as UserRelationshipInfra } from '.'
import { insertEvent } from '../event'
import { Common } from '..'

export const unfriend =
  (pgClient: PoolClient): UserRelationship.Mutations.Unfriend =>
    async (event, persistEvent) => {
      if (persistEvent)
        await Common.pgTransaction(pgClient, async () => {
          await updateUserRelationshipTable(pgClient, event)
          await insertEvent(pgClient, UserRelationshipInfra.eventTableName, event)
        })
    }

const updateUserRelationshipTable = async (
  pgClient: PoolClient,
  event: UserRelationship.UnfriendedUserEvent
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
      'unfriended',
      event.data.createdAt,
      event.data.aggregateId,
    ]
  )
}
