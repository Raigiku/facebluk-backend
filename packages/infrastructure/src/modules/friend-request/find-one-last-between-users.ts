import { FriendRequest } from '@facebluk/domain'
import { Pool } from 'pg'
import { friendRequestTableKey, friendRequestTableName, friendRequestTableToAggregate } from '.'

export const findOneLastFriendRequestBetweenUsers =
  (pool: Pool): FriendRequest.FnFindOneLastBetweenUsers =>
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
