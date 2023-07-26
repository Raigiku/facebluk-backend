import { ES } from '@facebluk/domain'
import { PoolClient } from 'pg'
import { eventTableName, friendRequestTableKey, friendRequestTableName } from '.'
import { registerEvent } from '../../common'

export const send =
  (pgClient: PoolClient): ES.FriendRequest.FnSend =>
  async (event: ES.FriendRequest.SentEvent) => {
    await _send(pgClient, event)
    await registerEvent(pgClient, eventTableName, event)
  }

export const _send = async (pgClient: PoolClient, event: ES.FriendRequest.SentEvent) => {
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

export const cancel =
  (pgClient: PoolClient): ES.FriendRequest.FnCancel =>
  async (event: ES.FriendRequest.CancelledEvent) => {
    await _cancel(pgClient, event)
    await registerEvent(pgClient, eventTableName, event)
  }

export const _cancel = async (pgClient: PoolClient, event: ES.FriendRequest.CancelledEvent) => {
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

export const reject =
  (pgClient: PoolClient): ES.FriendRequest.FnReject =>
  async (event: ES.FriendRequest.RejectedEvent) => {
    await _reject(pgClient, event)
    await registerEvent(pgClient, eventTableName, event)
  }

export const _reject = async (pgClient: PoolClient, event: ES.FriendRequest.RejectedEvent) => {
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

export const accept =
  (pgClient: PoolClient): ES.FriendRequest.FnAccept =>
  async (event: ES.FriendRequest.AcceptedEvent) => {
    await _accept(pgClient, event)
    await registerEvent(pgClient, eventTableName, event)
  }

export const _accept = async (pgClient: PoolClient, event: ES.FriendRequest.AcceptedEvent) => {
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
