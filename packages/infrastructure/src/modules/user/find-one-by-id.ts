import { User } from '@facebluk/domain'
import { Pool } from 'pg'
import { UserTable, userTableKey, userTableName, userTableToAggregate } from '.'

export const findOneById =
  (pool: Pool): User.DbQueries.FindOneById =>
  async (userId: string) => {
    const { rows } = await pool.query<UserTable>(
      `
      SELECT *
      FROM ${userTableName} u
      WHERE u.${userTableKey('id')} = $1
      `,
      [userId]
    )
    if (rows.length === 0) return undefined
    return userTableToAggregate(rows[0])
  }
