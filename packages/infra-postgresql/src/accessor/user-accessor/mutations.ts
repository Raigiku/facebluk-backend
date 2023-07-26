import { ES } from '@facebluk/domain'
import { PoolClient } from 'pg'
import { eventTableName, userTableKey, userTableName } from '.'
import { registerEvent } from '../../common'

export const register =
  (pgClient: PoolClient): ES.User.FnRegister =>
  async (event: ES.User.RegisteredEvent) => {
    await _register(pgClient, event)
    await registerEvent(pgClient, eventTableName, event)
  }

export const _register = async (pgClient: PoolClient, event: ES.User.RegisteredEvent) => {
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

export const updateInfo =
  (pgClient: PoolClient): ES.User.FnUpdateInfo =>
  async (event: ES.User.InfoUpdatedEvent) => {
    await pgClient.query(
      `
        UPDATE ${userTableName}
        SET
          ${userTableKey('name')} = $1,
          ${userTableKey('profile_picture_url')} = $2
        WHERE ${userTableKey('id')} = $3
      `,
      [event.payload.name, event.payload.profilePictureUrl, event.data.aggregateId]
    )
    await registerEvent(pgClient, eventTableName, event)
  }
