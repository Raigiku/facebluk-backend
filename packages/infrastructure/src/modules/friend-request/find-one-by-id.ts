import { FriendRequest } from '@facebluk/domain'
import { Pool } from 'pg'
import { friendRequestTableKey, friendRequestTableName, friendRequestTableToAggregate } from '.'

export const findOneById =
  (pool: Pool): FriendRequest.DbQueries.FindOneById =>
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
