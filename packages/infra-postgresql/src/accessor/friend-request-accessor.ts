import { ES } from '@facebluk/domain'
import { Pool, PoolClient } from 'pg'
import { EventTable, eventTableKey, registerEvent } from '../common'

export const eventTableName = 'friend_request_event'
export const friendRequestTableName = 'friend_request'

export const findOneById =
  (pool: Pool): ES.FriendRequest.FnFindOneById =>
  async (id: string) => {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM ${friendRequestTableName} fr
      WHERE fr.${friendRequestTableKey('id')} = $1
      `,
      [id]
    )
    if (rows.length === 0) return undefined
    return friendRequestTableToAggregate(rows[0])
  }

export const findOneLastFriendRequestBetweenUsers =
  (pool: Pool): ES.FriendRequest.FnFindOneLastBetweenUsers =>
  async (userAId: string, userBId: string) => {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM ${friendRequestTableName} fr
      WHERE (
          fr.${friendRequestTableKey('from_user_id')} = $1 
          AND fr.${friendRequestTableKey('to_user_id')} = $2
        ) OR (
          fr.${friendRequestTableKey('to_user_id')} = $1
          AND fr.${friendRequestTableKey('from_user_id')} = $2
        )
      ORDER BY fr.${friendRequestTableKey('created_at')} DESC
      LIMIT 1
      `,
      [userAId, userBId]
    )
    if (rows.length === 0) return undefined
    return friendRequestTableToAggregate(rows[0])
  }

export const findManyEventsInOrder = async (pool: Pool) => {
  const { rows } = await pool.query<EventTable>(
    `
      SELECT *
      FROM ${eventTableName} e
      ORDER BY e.${eventTableKey('created_at')} ASC
    `
  )
  return rows
}

export const send =
  (pgClient: PoolClient): ES.FriendRequest.FnSend =>
  async (event: ES.FriendRequest.SentEvent) => {
    await sendInternalAggregate(pgClient, event)
    await registerEvent(pgClient, eventTableName, event)
  }

export const sendInternalAggregate = async (
  pgClient: PoolClient,
  event: ES.FriendRequest.SentEvent
) => {
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
    await cancelInternalAggregate(pgClient, event)
    await registerEvent(pgClient, eventTableName, event)
  }

export const cancelInternalAggregate = async (
  pgClient: PoolClient,
  event: ES.FriendRequest.CancelledEvent
) => {
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
    await rejectInternalAggregate(pgClient, event)
    await registerEvent(pgClient, eventTableName, event)
  }

export const rejectInternalAggregate = async (
  pgClient: PoolClient,
  event: ES.FriendRequest.RejectedEvent
) => {
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
    await acceptInternalAggregate(pgClient, event)
    await registerEvent(pgClient, eventTableName, event)
  }

export const acceptInternalAggregate = async (
  pgClient: PoolClient,
  event: ES.FriendRequest.AcceptedEvent
) => {
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

type FriendRequestTable = {
  readonly id: string
  readonly version: bigint
  readonly created_at: Date
  readonly from_user_id: string
  readonly to_user_id: string
  readonly accepted_at: Date | null
  readonly cancelled_at: Date | null
  readonly rejected_at: Date | null
}

const friendRequestTableKey = (k: keyof FriendRequestTable) => k

const friendRequestTableToAggregate = (row: FriendRequestTable): ES.FriendRequest.Aggregate => {
  let friendRequestStatus: ES.FriendRequest.AggregateStatus
  if (row.accepted_at !== null)
    friendRequestStatus = { tag: 'accepted', acceptedAt: row.accepted_at }
  else if (row.cancelled_at !== null)
    friendRequestStatus = { tag: 'cancelled', cancelledAt: row.cancelled_at }
  else if (row.rejected_at !== null)
    friendRequestStatus = { tag: 'rejected', rejectedAt: row.rejected_at }
  else friendRequestStatus = { tag: 'pending' }

  return {
    aggregate: { id: row.id, version: row.version, createdAt: row.created_at },
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    status: friendRequestStatus,
  }
}
