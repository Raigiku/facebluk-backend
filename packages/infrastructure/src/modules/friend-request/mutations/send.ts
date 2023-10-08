import { FriendRequest } from '@facebluk/domain'
import { PoolClient } from 'pg'
import { PostgreSQL as FriendRequestInfra } from '../index'
import { insertEvent } from '../../event'
import { Common } from '../..'

export const send =
  (pgClient: PoolClient): FriendRequest.Mutations.Send =>
  async (event, persistEvent) => {
    if (persistEvent)
      await Common.pgTransaction(pgClient, async () => {
        await insertInFriendRequestTable(pgClient, event)
        await insertEvent(pgClient, FriendRequestInfra.eventTableName, event)
      })
  }

export const insertInFriendRequestTable = async (
  pgClient: PoolClient,
  event: FriendRequest.SentEvent
) => {
  await pgClient.query(
    `
      INSERT INTO ${FriendRequestInfra.friendRequestTableName} (
        ${FriendRequestInfra.friendRequestTableKey('id')},
        ${FriendRequestInfra.friendRequestTableKey('created_at')},
        ${FriendRequestInfra.friendRequestTableKey('from_user_id')},
        ${FriendRequestInfra.friendRequestTableKey('to_user_id')}
      )
      VALUES ($1, $2, $3, $4)
    `,
    [event.data.aggregateId, event.data.createdAt, event.payload.fromUserId, event.payload.toUserId]
  )
}
