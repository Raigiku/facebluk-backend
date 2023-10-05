import { FriendRequest } from '@facebluk/domain'
import { PoolClient } from 'pg'
import { PostgreSQL as FriendRequestInfra } from '.'
import { insertEvent } from '../event'
import { Common } from '..'

export const reject =
  (pgClient: PoolClient): FriendRequest.Mutations.Reject =>
  async (event, persistEvent) => {
    if (persistEvent)
      await Common.pgTransaction(pgClient, async () => {
        await updateUserRelationshipTable(pgClient, event)
        await insertEvent(pgClient, FriendRequestInfra.eventTableName, event)
      })
  }

const updateUserRelationshipTable = async (
  pgClient: PoolClient,
  event: FriendRequest.RejectedEvent
) => {
  await pgClient.query(
    `
      UPDATE ${FriendRequestInfra.friendRequestTableName}
      SET 
        ${FriendRequestInfra.friendRequestTableKey('rejected_at')} = $1
      WHERE ${FriendRequestInfra.friendRequestTableKey('id')} = $2
    `,
    [event.data.createdAt, event.data.aggregateId]
  )
}
