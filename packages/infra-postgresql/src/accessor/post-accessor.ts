import { ES } from '@facebluk/domain'
import { Pool } from 'pg'
import { registerEvent } from '../common'

export const eventTableName = 'post_event'
export const postTableName = 'post'

export const register =
  (pool: Pool): ES.Post.FnRegister =>
  async (post: ES.Post.Aggregate, event: ES.Post.CreatedEvent) => {
    try {
      await pool.query('BEGIN')
      await pool.query(
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
          post.aggregate.id,
          post.aggregate.version,
          post.aggregate.createdAt,
          post.description,
          post.userId,
        ]
      )
      await registerEvent(pool, eventTableName, event)
      await pool.query('COMMIT')
    } catch (error) {
      await pool.query('ROLLBACK')
      throw error
    }
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
