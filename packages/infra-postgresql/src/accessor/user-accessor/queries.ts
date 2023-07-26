import { ES } from '@facebluk/domain'
import { Pool } from 'pg'
import { UserTable, eventTableName, userTableKey, userTableName, userTableToAggregate } from '.'
import { EventTable, eventTableKey } from '../../common'

export const findManyEventsInOrder = async (pool: Pool) => {
  const { rows } = await pool.query<EventTable>(
    `
      SELECT *
      FROM ${eventTableName} e
      ORDER BY e.${eventTableKey('created_at')} ASC
    `
  )
  return rows
}

export const aliasExists =
  (pool: Pool): ES.User.FnAliasExists =>
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

export const findOneById =
  (pool: Pool): ES.User.FnFindOneById =>
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
