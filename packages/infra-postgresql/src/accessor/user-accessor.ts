import { ES } from '@facebluk/domain'
import { Pool } from 'pg'
import { EventTable, eventTableKey, initEventDataFromEventTable } from '../common'

export const tableName = 'user_event'

export const getRegisteredUserEvent =
  (pool: Pool): ES.User.FnGetRegisteredUserEvent =>
  async (id: string) => {
    const { rows } = await pool.query(
      `
        SELECT *
        FROM ${tableName} e
        WHERE e.${eventTableKey('aggregate_id')} = $1
          AND e.${eventTableKey('payload')}->>'tag' = $2
      `,
      [id, ES.User.registeredUserEventTag]
    )
    if (rows.length === 0) return undefined

    const event = rows[0] as EventTable
    if (event.payload.tag === 'user-registered')
      return {
        data: initEventDataFromEventTable(event),
        payload: event.payload,
      }

    return undefined
  }

export const isAliasAvailable =
  (pool: Pool): ES.User.FnIsAliasAvailable =>
  async (alias: string) => {
    const { rows } = await pool.query(
      `
      SELECT 1
      FROM ${tableName} e
      WHERE e.${eventTableKey('payload')}->>'tag' = $1
        AND e.${eventTableKey('payload')}->>'alias' = $2
    `,
      [ES.User.registeredUserEventTag, alias]
    )
    return rows.length === 0
  }
