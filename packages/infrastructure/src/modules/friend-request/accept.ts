import { FriendRequest } from '@facebluk/domain'
import { PoolClient } from 'pg'
import { eventTableName, friendRequestTableKey, friendRequestTableName } from '.'
import { registerEvent } from '../event'

export const accept =
  (pgClient: PoolClient): FriendRequest.FnAccept =>
  async (event: FriendRequest.AcceptedEvent) => {
    await _accept(pgClient, event)
    await registerEvent(pgClient, eventTableName, event)
  }

export const _accept = async (pgClient: PoolClient, event: FriendRequest.AcceptedEvent) => {
  await pgClient.query(
    `
      UPDATE ${friendRequestTableName}
      SET 
        ${friendRequestTableKey('version')} = $1,
        ${friendRequestTableKey('accepted_at')} = $2
      WHERE ${friendRequestTableKey('id')} = $3
    `,
    [event.data.aggregateVersion, event.data.createdAt, event.data.aggregateId]
  )
}
