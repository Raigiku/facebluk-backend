import { User } from '@facebluk/domain'
import { PoolClient } from 'pg'
import { eventTableName, userTableKey, userTableName } from '.'
import { registerEvent } from '../event'
import { Common } from '..'

export const updateInfo =
  (pgClient: PoolClient): User.FnUpdateInfo =>
  async (event: User.InfoUpdatedEvent) => {
    await Common.pgTransaction(pgClient, async () => {
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
    })
  }
