import { FriendRequest } from '@facebluk/domain'
import { PoolClient } from 'pg'
import { eventTableName, friendRequestTableKey, friendRequestTableName } from '.'
import { registerEvent } from '../event'

export const send =
  (pgClient: PoolClient): FriendRequest.FnSend =>
  async (event: FriendRequest.SentEvent) => {
    await _send(pgClient, event)
    await registerEvent(pgClient, eventTableName, event)
  }

export const _send = async (pgClient: PoolClient, event: FriendRequest.SentEvent) => {
  await pgClient.query(
    `
      INSERT INTO ${friendRequestTableName} (
        ${friendRequestTableKey('id')},
        ${friendRequestTableKey('version')},
        ${friendRequestTableKey('created_at')},
        ${friendRequestTableKey('from_user_id')},
        ${friendRequestTableKey('to_user_id')}
      )
      VALUES ($1, $2, $3, $4, $5)
    `,
    [
      event.data.aggregateId,
      event.data.aggregateVersion,
      event.data.createdAt,
      event.payload.fromUserId,
      event.payload.toUserId,
    ]
  )
}
