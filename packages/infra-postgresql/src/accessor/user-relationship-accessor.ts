import { ES } from '@facebluk/domain'
import { Pool, PoolClient } from 'pg'
import { EventTable, eventTableKey, registerEvent } from '../common'

export const eventTableName = 'user_relationship_event'
export const userRelationshipTableName = 'user_relationship'

export const findOneBetweenUsers =
  (pool: Pool): ES.UserRelationship.FnFindOneBetweenUsers =>
  async (userAId: string, userBId: string) => {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM ${userRelationshipTableName} ur
      WHERE (
        ur.${userRelationshipTableKey('friend_from_user_id')} = $1
        AND ur.${userRelationshipTableKey('friend_to_user_id')} = $2
      ) OR (
        ur.${userRelationshipTableKey('friend_to_user_id')} = $1
        AND ur.${userRelationshipTableKey('friend_from_user_id')} = $2
      ) OR (
        ur.${userRelationshipTableKey('blocked_from_user_id')} = $1
        AND ur.${userRelationshipTableKey('blocked_to_user_id')} = $2
      ) OR (
        ur.${userRelationshipTableKey('blocked_to_user_id')} = $1
        AND ur.${userRelationshipTableKey('blocked_from_user_id')} = $2
      )
      `,
      [userAId, userBId]
    )
    if (rows.length === 0) return undefined
    return userRelationshipTableToAggregate(rows[0])
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

export const friend =
  (pgClient: PoolClient): ES.UserRelationship.FnFriend =>
  async (isNew: boolean, event: ES.UserRelationship.FriendedUserEvent) => {
    await friendInternalAggregate(pgClient, isNew, event)
    await registerEvent(pgClient, eventTableName, event)
  }

export const friendInternalAggregate = async (
  pgClient: PoolClient,
  isNew: boolean,
  event: ES.UserRelationship.FriendedUserEvent
) => {
  if (isNew)
    await pgClient.query(
      `
        INSERT INTO ${userRelationshipTableName} (
          ${userRelationshipTableKey('id')},
          ${userRelationshipTableKey('version')},
          ${userRelationshipTableKey('created_at')},
          ${userRelationshipTableKey('friend_from_user_id')},
          ${userRelationshipTableKey('friend_to_user_id')},
          ${userRelationshipTableKey('friend_status')},
          ${userRelationshipTableKey('friend_status_updated_at')}
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        event.data.aggregateId,
        event.data.aggregateVersion,
        event.data.createdAt,
        event.payload.fromUserId,
        event.payload.toUserId,
        'friended',
        event.data.createdAt,
      ]
    )
  else
    await pgClient.query(
      `
        UPDATE ${userRelationshipTableName}
        SET 
          ${userRelationshipTableKey('version')} = $1,
          ${userRelationshipTableKey('friend_from_user_id')} = $2,
          ${userRelationshipTableKey('friend_to_user_id')} = $3,
          ${userRelationshipTableKey('friend_status')} = $4,
          ${userRelationshipTableKey('friend_status_updated_at')} = $5
        WHERE ${userRelationshipTableKey('id')} = $6
      `,
      [
        event.data.aggregateVersion,
        event.payload.fromUserId,
        event.payload.toUserId,
        'friended',
        event.data.createdAt,
        event.data.aggregateId,
      ]
    )
}

export const unfriend =
  (pgClient: PoolClient): ES.UserRelationship.FnUnfriend =>
  async (event: ES.UserRelationship.UnfriendedUserEvent) => {
    await unfriendInternalAggregate(pgClient, event)
    await registerEvent(pgClient, eventTableName, event)
  }

export const unfriendInternalAggregate = async (
  pgClient: PoolClient,
  event: ES.UserRelationship.UnfriendedUserEvent
) => {
  await pgClient.query(
    `
      UPDATE ${userRelationshipTableName}
      SET 
        ${userRelationshipTableKey('version')} = $1,
        ${userRelationshipTableKey('friend_from_user_id')} = $2,
        ${userRelationshipTableKey('friend_to_user_id')} = $3,
        ${userRelationshipTableKey('friend_status')} = $4,
        ${userRelationshipTableKey('friend_status_updated_at')} = $5
      WHERE ${userRelationshipTableKey('id')} = $6
    `,
    [
      event.data.aggregateVersion,
      event.payload.fromUserId,
      event.payload.toUserId,
      'unfriended',
      event.data.createdAt,
      event.data.aggregateId,
    ]
  )
}

type UserRelationshipTable = {
  readonly id: string
  readonly version: bigint
  readonly created_at: Date
  readonly friend_from_user_id: string | null
  readonly friend_to_user_id: string | null
  readonly friend_status: 'friended' | 'unfriended' | null
  readonly friend_status_updated_at: Date | null
  readonly blocked_from_user_id: string | null
  readonly blocked_to_user_id: string | null
  readonly blocked_status: 'blocked' | 'unblocked' | null
  readonly blocked_status_updated_at: Date | null
}

const userRelationshipTableKey = (k: keyof UserRelationshipTable) => k

const userRelationshipTableToAggregate = (
  row: UserRelationshipTable
): ES.UserRelationship.Aggregate<
  ES.UserRelationship.BlockStatus,
  ES.UserRelationship.FriendStatus
> => {
  let friendStatus: ES.UserRelationship.FriendStatus
  if (row.friend_status !== undefined) {
    if (row.friend_status === 'friended')
      friendStatus = {
        tag: 'friended',
        fromUserId: row.friend_from_user_id!,
        toUserId: row.friend_to_user_id!,
        friendedAt: row.friend_status_updated_at!,
      }
    else
      friendStatus = {
        tag: 'unfriended',
        fromUserId: row.friend_from_user_id!,
        toUserId: row.friend_to_user_id!,
        unfriendedAt: row.friend_status_updated_at!,
      }
  } else friendStatus = { tag: 'not-friended' }

  let blockedStatus: ES.UserRelationship.BlockStatus
  if (row.blocked_status !== undefined) {
    if (row.blocked_status === 'blocked')
      blockedStatus = {
        tag: 'blocked',
        fromUserId: row.blocked_from_user_id!,
        toUserId: row.blocked_to_user_id!,
        blockedAt: row.blocked_status_updated_at!,
      }
    else
      blockedStatus = {
        tag: 'unblocked',
        fromUserId: row.blocked_from_user_id!,
        toUserId: row.blocked_to_user_id!,
        unblockedAt: row.blocked_status_updated_at!,
      }
  } else blockedStatus = { tag: 'not-blocked' }

  return {
    aggregate: { id: row.id, version: row.version, createdAt: row.created_at },
    friendStatus,
    blockedStatus,
  }
}
