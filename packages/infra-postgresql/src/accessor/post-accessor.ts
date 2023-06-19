import { ES } from '@facebluk/domain'
import { PoolClient } from 'pg'
import { registerEvent } from '../common'

export const eventTableName = 'post_event'
export const postTableName = 'post'

export const register =
  (pgClient: PoolClient): ES.Post.FnCreate =>
  async (event: ES.Post.CreatedEvent) => {
    await pgClient.query(
      `
          INSERT INTO ${postTableName} (
            ${postTableKey('id')},
            ${postTableKey('version')},
            ${postTableKey('created_at')},
            ${postTableKey('description')},
            ${postTableKey('user_id')}
          )
          VALUES ($1, $2, $3, $4, $5)
        `,
      [
        event.data.aggregateId,
        event.data.aggregateVersion,
        event.data.createdAt,
        event.payload.description,
        event.payload.userId,
      ]
    )
    await registerEvent(pgClient, eventTableName, event)
  }

type PostTable = {
  readonly id: string
  readonly version: bigint
  readonly created_at: Date
  readonly description: string
  readonly user_id: string
}

const postTableKey = (k: keyof PostTable) => k

const postTableToAggregate = (row: PostTable): ES.Post.Aggregate => ({
  aggregate: { id: row.id, version: row.version, createdAt: row.created_at },
  description: row.description,
  userId: row.user_id,
})
