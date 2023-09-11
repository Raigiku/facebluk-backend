import { Post } from '@facebluk/domain'
import { PoolClient } from 'pg'
import { postTableKey, postTableName } from '.'
import { registerEvent } from '../event'
import { eventTableName } from '../user'

export const create =
  (pgClient: PoolClient): Post.FnCreate =>
  async (event: Post.CreatedEvent) => {
    await _create(pgClient, event)
    await registerEvent(pgClient, eventTableName, event)
  }

export const _create = async (pgClient: PoolClient, event: Post.CreatedEvent) => {
  await pgClient.query(
    `
      INSERT INTO ${postTableName} (
        ${postTableKey('id')},
        ${postTableKey('version')},
        ${postTableKey('created_at')},
        ${postTableKey('description')},
        ${postTableKey('user_id')},
        ${postTableKey('tagged_user_ids')}
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      event.data.aggregateId,
      event.data.aggregateVersion,
      event.data.createdAt,
      event.payload.description,
      event.payload.userId,
      event.payload.taggedUserIds,
    ]
  )
}
