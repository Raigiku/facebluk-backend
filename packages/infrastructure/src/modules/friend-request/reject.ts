import { FriendRequest } from '@facebluk/domain'
import { PoolClient } from 'pg'
import { eventTableName, friendRequestTableKey, friendRequestTableName } from '.'
import { registerEvent } from '../event'

export const reject =
  (pgClient: PoolClient): FriendRequest.FnReject =>
  async (event: FriendRequest.RejectedEvent) => {
    await _reject(pgClient, event)
    await registerEvent(pgClient, eventTableName, event)
  }

export const _reject = async (pgClient: PoolClient, event: FriendRequest.RejectedEvent) => {
  await pgClient.query(
    `
      UPDATE ${friendRequestTableName}
      SET 
        ${friendRequestTableKey('version')} = $1,
        ${friendRequestTableKey('rejected_at')} = $2
      WHERE ${friendRequestTableKey('id')} = $3
    `,
    [event.data.aggregateVersion, event.data.createdAt, event.data.aggregateId]
  )
}
