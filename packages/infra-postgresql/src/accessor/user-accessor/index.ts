import { ES } from '@facebluk/domain'
export * from './mutations'
export * from './queries'

export const eventTableName = 'user_event'
export const userTableName = '"user"'

export type UserTable = {
  readonly id: string
  readonly version: bigint
  readonly created_at: Date
  readonly alias: string
  readonly name: string
  readonly profile_picture_url: string | null
}

export const userTableKey = (k: keyof UserTable) => k

export const userTableToAggregate = (row: UserTable): ES.User.Aggregate => ({
  aggregate: { id: row.id, version: row.version, createdAt: row.created_at },
  alias: row.alias,
  name: row.name,
  profilePictureUrl: row.profile_picture_url ?? undefined,
})
