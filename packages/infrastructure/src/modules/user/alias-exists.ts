import { User } from '@facebluk/domain'
import { Pool } from 'pg'
import { userTableKey, userTableName } from '.'

export const aliasExists =
  (pool: Pool): User.DbQueries.AliasExists =>
  async (alias: string) => {
    const { rows } = await pool.query(
      `
      SELECT 1
      FROM ${userTableName} u
      WHERE u.${userTableKey('alias')} = $1
      `,
      [alias]
    )
    return rows.length !== 0
  }
