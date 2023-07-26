import { Pool } from 'pg'
import { eventTableName } from '.'
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
