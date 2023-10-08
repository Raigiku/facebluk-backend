import { FriendRequest } from '@facebluk/domain'
import { Pool } from 'pg'
import { PostgreSQL as FriendRequestInfra } from '.'

export const findLastFriendRequestBetweenUsers =
  (pool: Pool): FriendRequest.DbQueries.FindLastBetweenUsers =>
  async (userAId: string, userBId: string) => {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM ${FriendRequestInfra.friendRequestTableName} fr
      WHERE (
          fr.${FriendRequestInfra.friendRequestTableKey('from_user_id')} = $1 
          AND fr.${FriendRequestInfra.friendRequestTableKey('to_user_id')} = $2
        ) OR (
          fr.${FriendRequestInfra.friendRequestTableKey('to_user_id')} = $1
          AND fr.${FriendRequestInfra.friendRequestTableKey('from_user_id')} = $2
        )
      ORDER BY fr.${FriendRequestInfra.friendRequestTableKey('created_at')} DESC
      LIMIT 1
      `,
      [userAId, userBId]
    )
    if (rows.length === 0) return undefined
    return FriendRequestInfra.friendRequestTableToAggregate(rows[0])
  }
