import { FriendRequest } from '@facebluk/domain'
import { Pool } from 'pg'
import { PostgreSQL as FriendRequestInfra } from '../..'

export const findById =
  (pool: Pool): FriendRequest.DbQueries.FindById =>
  async (id: string) => {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM ${FriendRequestInfra.friendRequestTableName} fr
      WHERE fr.${FriendRequestInfra.friendRequestTableKey('id')} = $1
      `,
      [id]
    )
    if (rows.length === 0) return undefined
    return FriendRequestInfra.friendRequestTableToAggregate(rows[0])
  }
