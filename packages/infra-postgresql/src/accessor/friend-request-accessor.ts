import { ES } from '@facebluk/domain'
import { Pool } from 'pg'
import { registerEvent } from '../common'

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

export const register =
  (pool: Pool): ES.FriendRequest.FnRegister =>
  async (friendRequest: ES.FriendRequest.Aggregate, event: ES.FriendRequest.SentEvent) => {
    const acceptedAt =
      friendRequest.status.tag === 'accepted' ? friendRequest.status.acceptedAt : undefined
    const cancelledAt =
      friendRequest.status.tag === 'cancelled' ? friendRequest.status.cancelledAt : undefined
    const rejectedAt =
      friendRequest.status.tag === 'rejected' ? friendRequest.status.rejectedAt : undefined

    try {
      await pool.query('BEGIN')
      await pool.query(
        `
          INSERT INTO ${friendRequestTableName} (
            ${friendRequestTableKey('id')},
            ${friendRequestTableKey('version')},
            ${friendRequestTableKey('created_at')},
            ${friendRequestTableKey('from_user_id')},
            ${friendRequestTableKey('to_user_id')},
            ${friendRequestTableKey('accepted_at')},
            ${friendRequestTableKey('cancelled_at')},
            ${friendRequestTableKey('rejected_at')}
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
        [
          friendRequest.aggregate.id,
          friendRequest.aggregate.version,
          friendRequest.aggregate.createdAt,
          friendRequest.fromUserId,
          friendRequest.toUserId,
          acceptedAt,
          cancelledAt,
          rejectedAt,
        ]
      )
      await registerEvent(pool, eventTableName, event)
      await pool.query('COMMIT')
    } catch (error) {
      await pool.query('ROLLBACK')
      throw error
    }
  }

type FriendRequestTable = {
  readonly id: string
  readonly version: bigint
  readonly created_at: Date
  readonly from_user_id: string
  readonly to_user_id: string
  readonly accepted_at?: Date
  readonly cancelled_at?: Date
  readonly rejected_at?: Date
}

const friendRequestTableKey = (k: keyof FriendRequestTable) => k

const friendRequestTableToAggregate = (row: FriendRequestTable): ES.FriendRequest.Aggregate => {
  let friendRequestStatus: ES.FriendRequest.AggregateStatus
  if (row.accepted_at !== undefined)
    friendRequestStatus = { tag: 'accepted', acceptedAt: row.accepted_at }
  else if (row.cancelled_at !== undefined)
    friendRequestStatus = { tag: 'cancelled', cancelledAt: row.cancelled_at }
  else if (row.rejected_at !== undefined)
    friendRequestStatus = { tag: 'rejected', rejectedAt: row.rejected_at }
  else friendRequestStatus = { tag: 'pending' }

  return {
    aggregate: { id: row.id, version: row.version, createdAt: row.created_at },
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    status: friendRequestStatus,
  }
}
