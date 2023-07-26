import { ES } from '@facebluk/domain'
export * from './mutations'
export * from './queries'

export const eventTableName = 'post_event'
export const postTableName = 'post'

export type PostTable = {
  readonly id: string
  readonly version: bigint
  readonly created_at: Date
  readonly description: string
  readonly user_id: string
  readonly tagged_user_ids: string[]
}

export const postTableKey = (k: keyof PostTable) => k

export const postTableToAggregate = (row: PostTable): ES.Post.Aggregate => ({
  aggregate: { id: row.id, version: row.version, createdAt: row.created_at },
  description: row.description,
  userId: row.user_id,
  taggedUserIds: row.tagged_user_ids,
})
