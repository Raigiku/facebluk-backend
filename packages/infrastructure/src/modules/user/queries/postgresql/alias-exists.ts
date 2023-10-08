import { User } from '@facebluk/domain'
import { Pool } from 'pg'
import { PostgreSQL as UserInfra } from '../..'

export const aliasExists =
  (pool: Pool): User.DbQueries.AliasExists =>
  async (alias: string) => {
    const { rows } = await pool.query(
      `
      SELECT 1
      FROM ${UserInfra.userTableName} u
      WHERE u.${UserInfra.userTableKey('alias')} = $1
      `,
      [alias]
    )
    return rows.length !== 0
  }
