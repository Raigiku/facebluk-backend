import { Post } from '@facebluk/domain'
import { PoolClient } from 'pg'
import { PostgreSQL as PostInfra } from '..'
import { insertEvent } from '../../event'
import { Common } from '../..'

export const create =
  (pgClient: PoolClient): Post.Mutations.Create =>
  async (event, persistEvent) => {
    if (persistEvent)
      await Common.pgTransaction(pgClient, async () => {
        await insertInPostTable(pgClient, event)
        await insertEvent(pgClient, PostInfra.eventTableName, event)
      })
  }

const insertInPostTable = async (pgClient: PoolClient, event: Post.CreatedEvent) => {
  await pgClient.query(
    `
      INSERT INTO ${PostInfra.postTableName} (
        ${PostInfra.postTableKey('id')},
        ${PostInfra.postTableKey('created_at')},
        ${PostInfra.postTableKey('description')},
        ${PostInfra.postTableKey('user_id')},
        ${PostInfra.postTableKey('tagged_user_ids')}
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
