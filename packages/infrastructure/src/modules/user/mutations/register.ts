import { User } from '@facebluk/domain'
import { PoolClient } from 'pg'
import { PostgreSQL as UserInfra } from '..'
import { insertEvent } from '../../event'
import { Common } from '../..'
import { SupabaseClient } from '@supabase/supabase-js'

export const register =
  (pgClient: PoolClient, supabaseClient: SupabaseClient): User.Mutations.Register =>
    async (event, persistEvent, markAsRegistered) => {
      if (persistEvent)
        await Common.pgTransaction(pgClient, async () => {
          await insertInUserTable(pgClient, event)
          await insertEvent(pgClient, UserInfra.eventTableName, event)
        })

      if (markAsRegistered)
        await markSupabaseUserAsRegistered(
          supabaseClient,
          event.data.aggregateId,
          event.data.createdAt
        )
    }

const insertInUserTable = async (pgClient: PoolClient, event: User.RegisteredEvent) => {
  await pgClient.query(
    `
      INSERT INTO ${UserInfra.userTableName} (
        ${UserInfra.userTableKey('id')},
        ${UserInfra.userTableKey('created_at')},
        ${UserInfra.userTableKey('alias')},
        ${UserInfra.userTableKey('name')},
        ${UserInfra.userTableKey('profile_picture_url')}
      )
      VALUES ($1, $2, $3, $4, $5)
    `,
    [
      event.data.aggregateId,
      event.data.createdAt,
      event.payload.alias,
      event.payload.name,
      event.payload.profilePictureUrl,
    ]
  )
}

const markSupabaseUserAsRegistered = async (
  supabaseClient: SupabaseClient,
  userId: string,
  registeredAt: Date
) => {
  const { error } = await supabaseClient.auth.admin.updateUserById(userId, {
    user_metadata: { registeredAt },
  })
  if (error !== null) {
    throw error
  }
}
