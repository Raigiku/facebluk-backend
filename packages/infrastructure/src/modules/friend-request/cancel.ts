import { FriendRequest } from '@facebluk/domain'
import { PoolClient } from 'pg'
import { eventTableName, friendRequestTableKey, friendRequestTableName } from '.'
import { registerEvent } from '../event'

export const cancel =
  (pgClient: PoolClient): FriendRequest.FnCancel =>
  async (event: FriendRequest.CancelledEvent) => {
    await _cancel(pgClient, event)
    await registerEvent(pgClient, eventTableName, event)
  }

export const _cancel = async (pgClient: PoolClient, event: FriendRequest.CancelledEvent) => {
  await pgClient.query(
    `
      UPDATE ${friendRequestTableName}
      SET 
        ${friendRequestTableKey('version')} = $1,
        ${friendRequestTableKey('cancelled_at')} = $2
      WHERE ${friendRequestTableKey('id')} = $3
    `,
    [event.data.aggregateVersion, event.data.createdAt, event.data.aggregateId]
  )
}
