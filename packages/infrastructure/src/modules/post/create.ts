import { Post } from '@facebluk/domain'
import { PoolClient } from 'pg'
import { postTableKey, postTableName } from '.'
import { insertEvent } from '../event'
import { eventTableName } from '../user'
import { Common } from '..'

export const create =
  (pgClient: PoolClient): Post.Mutations.Create =>
  async (event, persistEvent) => {
    if (persistEvent)
      await Common.pgTransaction(pgClient, async () => {
        await insertInPostTable(pgClient, event)
        await insertEvent(pgClient, eventTableName, event)
      })
  }

const insertInPostTable = async (pgClient: PoolClient, event: Post.CreatedEvent) => {
  await pgClient.query(
    `
      INSERT INTO ${postTableName} (
        ${postTableKey('id')},
        ${postTableKey('created_at')},
        ${postTableKey('description')},
        ${postTableKey('user_id')},
        ${postTableKey('tagged_user_ids')}
      )
      VALUES ($1, $2, $3, $4, $5)
    `,
    [
      event.data.aggregateId,
      event.data.createdAt,
      event.payload.description,
      event.payload.userId,
      event.payload.taggedUserIds,
    ]
  )
}
