import { EventData } from '@facebluk/domain'
import { PoolClient } from 'pg'
import { eventTableKey } from '.'

export const registerEvent = async (
  pgClient: PoolClient,
  tableName: string,
  event: EventData.AnyEvent
) => {
  await pgClient.query(
    `
      INSERT INTO ${tableName} (
        ${eventTableKey('aggregate_id')},
        ${eventTableKey('aggregate_version')},
        ${eventTableKey('created_at')},
        ${eventTableKey('published')},
        ${eventTableKey('payload')}
      )
      VALUES ($1, $2, $3, $4, $5)
    `,
    [
      event.data.aggregateId,
      event.data.aggregateVersion,
      event.data.createdAt,
      event.data.published,
      event.payload,
    ]
  )
}
