import { Db } from 'mongodb'
import { User as UserInfra } from '../../index'
import { User } from '@facebluk/domain'

export const applyInfoUpdatedEvent =
  (mongoDb: Db) =>
    async (event: User.InfoUpdatedEvent) => {
        await mongoDb
          .collection<UserInfra.MongoDB.Document>(UserInfra.MongoDB.collectionName)
          .updateOne({
            'aggregate.id': event.data.aggregateId,
            appliedEvents: { $not: { $elemMatch: { id: event.data.eventId } } }
          }, {
            $set: {
              name: event.payload.name,
              profilePictureUrl: event.payload.profilePictureUrl,
            },
            $push: {
              appliedEvents: {
                id: event.data.eventId,
                createdAt: event.data.createdAt,
                tag: event.payload.tag,
                appliedAt: new Date(),
              }
            }
          }, {
            upsert: false
          })
    }