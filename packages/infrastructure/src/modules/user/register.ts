import { User } from '@facebluk/domain'
import { PoolClient } from 'pg'
import { eventTableName, userTableKey, userTableName } from '.'
import { registerEvent } from '../event'

export const register =
  (pgClient: PoolClient): User.FnRegister =>
  async (event: User.RegisteredEvent) => {
    await _register(pgClient, event)
    await registerEvent(pgClient, eventTableName, event)
  }

export const _register = async (pgClient: PoolClient, event: User.RegisteredEvent) => {
  await pgClient.query(
    `
      INSERT INTO ${userTableName} (
        ${userTableKey('id')},
        ${userTableKey('version')},
        ${userTableKey('created_at')},
        ${userTableKey('alias')},
        ${userTableKey('name')},
        ${userTableKey('profile_picture_url')}
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      event.data.aggregateId,
      event.data.aggregateVersion,
      event.data.createdAt,
      event.payload.alias,
      event.payload.name,
      event.payload.profilePictureUrl,
    ]
  )
}
