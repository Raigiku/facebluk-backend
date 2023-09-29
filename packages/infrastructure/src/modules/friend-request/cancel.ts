import { FriendRequest } from '@facebluk/domain'
import { PoolClient } from 'pg'
import { eventTableName, friendRequestTableKey, friendRequestTableName } from '.'
import { insertEvent } from '../event'
import { Common } from '..'

export const cancel =
  (pgClient: PoolClient): FriendRequest.Mutations.Cancel =>
  async (event, persistEvent) => {
    if (persistEvent)
      await Common.pgTransaction(pgClient, async () => {
        await updateUserRelationshipTable(pgClient, event)
        await insertEvent(pgClient, eventTableName, event)
      })
  }

const updateUserRelationshipTable = async (
  pgClient: PoolClient,
  event: FriendRequest.CancelledEvent
) => {
  await pgClient.query(
    `
      UPDATE ${friendRequestTableName}
      SET
        ${friendRequestTableKey('cancelled_at')} = $1
      WHERE ${friendRequestTableKey('id')} = $2
    `,
    [event.data.createdAt, event.data.aggregateId]
  )
}
