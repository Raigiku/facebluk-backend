import { Event } from '@facebluk/domain'
import { PoolClient } from 'pg'
import { eventTableKey } from '.'

export const insertEvent = async (
  pgClient: PoolClient,
  tableName: string,
  event: Event.AnyEvent
) => {
  await pgClient.query(
    `
      INSERT INTO ${tableName} (
        ${eventTableKey('event_id')},
        ${eventTableKey('aggregate_id')},
        ${eventTableKey('created_at')},
        ${eventTableKey('published')},
        ${eventTableKey('payload')}
      )
      VALUES ($1, $2, $3, $4, $5)
    `,
    [
      event.data.eventId,
      event.data.aggregateId,
      event.data.createdAt,
      event.data.published,
      event.payload,
    ]
  )
}
