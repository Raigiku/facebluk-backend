import { ES } from '@facebluk/domain'
import { Pool } from 'pg'
import { EventTable, eventTableKey, initEventDataFromEventTable } from '.'

export const TABLE_NAME = 'user_event'

export const getRegisteredUserEvent =
  (pool: Pool): ES.User.FnGetRegisteredUserEvent =>
  async (id: string) => {
    const { rows } = await pool.query(
      `
        SELECT *
        FROM ${TABLE_NAME} e
        WHERE e.${eventTableKey('aggregate_id')} = $1
          AND e.${eventTableKey('payload')}->>'tag' = $2
      `,
      [id, ES.User.REGISTERED_USER_EVENT_TAG]
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
