import { User } from '@facebluk/domain'
import { PoolClient } from 'pg'
import { PostgreSQL as UserInfra } from '..'
import { insertEvent } from '../../event'
import { Common } from '../..'

export const updateInfo =
  (pgClient: PoolClient): User.Mutations.UpdateInfo =>
    async (event, persistEvent) => {
      if (persistEvent)
        await Common.pgTransaction(pgClient, async () => {
          await updateUserTable(pgClient, event)
          await insertEvent(pgClient, UserInfra.eventTableName, event)
        })
    }

const updateUserTable = async (pgClient: PoolClient, event: User.InfoUpdatedEvent) => {
  if (event.payload.name !== undefined && event.payload.profilePictureUrl !== undefined)
    await pgClient.query(
      `
        UPDATE ${UserInfra.userTableName}
        SET
          ${UserInfra.userTableKey('name')} = $1,
          ${UserInfra.userTableKey('profile_picture_url')} = $2
        WHERE ${UserInfra.userTableKey('id')} = $3
      `,
      [event.payload.name, event.payload.profilePictureUrl, event.data.aggregateId]
    )
  else if (event.payload.name !== undefined)
    await pgClient.query(
      `
        UPDATE ${UserInfra.userTableName}
        SET ${UserInfra.userTableKey('name')} = $1
        WHERE ${UserInfra.userTableKey('id')} = $2
      `,
      [event.payload.name, event.data.aggregateId]
    )
  else if (event.payload.profilePictureUrl !== undefined)
    await pgClient.query(
      `
        UPDATE ${UserInfra.userTableName}
        SET ${UserInfra.userTableKey('profile_picture_url')} = $1
        WHERE ${UserInfra.userTableKey('id')} = $2
      `,
      [event.payload.profilePictureUrl, event.data.aggregateId]
    )
}
