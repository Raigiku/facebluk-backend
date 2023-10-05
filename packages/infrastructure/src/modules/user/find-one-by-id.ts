import { User } from '@facebluk/domain'
import { Pool } from 'pg'
import { PostgreSQL as UserInfra } from '.'

export const findOneById =
  (pool: Pool): User.DbQueries.FindOneById =>
  async (userId: string) => {
    const { rows } = await pool.query<UserInfra.UserTable>(
      `
      SELECT *
      FROM ${UserInfra.userTableName} u
      WHERE u.${UserInfra.userTableKey('id')} = $1
      `,
      [userId]
    )
    if (rows.length === 0) return undefined
    return UserInfra.userTableToAggregate(rows[0])
  }
