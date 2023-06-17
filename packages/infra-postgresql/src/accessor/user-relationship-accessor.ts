import { ES } from '@facebluk/domain'
import { Pool } from 'pg'

export const tableName = 'user_relationship_event'
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

type UserRelationshipTable = {
  readonly id: string
  readonly version: bigint
  readonly created_at: Date
  readonly friend_from_user_id?: string
  readonly friend_to_user_id?: string
  readonly friend_status?: 'friended' | 'unfriended'
  readonly friend_status_updated_at?: Date
  readonly blocked_from_user_id?: string
  readonly blocked_to_user_id?: string
  readonly blocked_status?: 'blocked' | 'unblocked'
  readonly blocked_status_updated_at?: Date
}

const userRelationshipTableKey = (k: keyof UserRelationshipTable) => k

const userRelationshipTableToAggregate = (
  row: UserRelationshipTable
): ES.UserRelationship.Aggregate => {
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
