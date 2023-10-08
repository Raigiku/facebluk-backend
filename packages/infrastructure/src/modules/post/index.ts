export * as Mutations from './mutations'

import { Post } from '@facebluk/domain'

// postgresql
export namespace PostgreSQL {
  export const eventTableName = 'post_event'

  export const postTableName = 'post'

  export type PostTable = {
    readonly id: string
    readonly created_at: Date
    readonly description: string
    readonly user_id: string
    readonly tagged_user_ids: string[]
  }

  export const postTableKey = (k: keyof PostTable) => k

  export const postTableToAggregate = (row: PostTable): Post.Aggregate => ({
    aggregate: { id: row.id, createdAt: row.created_at },
    description: row.description,
    userId: row.user_id,
    taggedUserIds: row.tagged_user_ids,
  })
}

// mongodb
export namespace MongoDB {
  export const collectionName = 'post'

  export type Document = Post.Aggregate
}