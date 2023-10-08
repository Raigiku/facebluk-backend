import { Db } from 'mongodb'
import { User as UserInfra } from '../../index'
import { User } from '@facebluk/domain'

export const applyInfoUpdatedEvent =
  (mongoDb: Db): User.Mutations.ApplyInfoUpdatedEvent =>
    async (event) => {
      await mongoDb
        .collection<UserInfra.MongoDB.Document>(UserInfra.MongoDB.collectionName)
        .updateOne({
          'aggregate.id': event.data.aggregateId,
        }, {
          $set: {
            name: event.payload.name,
            profilePictureUrl: event.payload.profilePictureUrl,
          }
        }, {
          upsert: false
        })
    }