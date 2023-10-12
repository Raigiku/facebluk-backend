import { Db } from 'mongodb'
import { FriendRequest as FriendRequestInfra } from '../..'
import { FriendRequest } from '@facebluk/domain'

export const applyCancelledEvent =
  (mongoDb: Db) =>
    async (event: FriendRequest.CancelledEvent) => {
        await mongoDb
          .collection<FriendRequestInfra.MongoDB.Document>(FriendRequestInfra.MongoDB.collectionName)
          .updateOne({
            'aggregate.id': event.data.aggregateId,
            appliedEvents: { $not: { $elemMatch: { id: event.data.eventId } } }
          }, {
            $set: {
              status: { tag: 'cancelled', cancelledAt: event.data.createdAt },
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