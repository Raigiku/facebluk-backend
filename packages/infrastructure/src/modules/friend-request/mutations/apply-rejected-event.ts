import { Db } from 'mongodb'
import { FriendRequest as FriendRequestInfra } from '../..'
import { FriendRequest } from '@facebluk/domain'

export const applyRejectedEvent =
  (mongoDb: Db) =>
    async (event: FriendRequest.RejectedEvent) => {
        await mongoDb
          .collection<FriendRequestInfra.MongoDB.Document>(FriendRequestInfra.MongoDB.collectionName)
          .updateOne({
            'aggregate.id': event.data.aggregateId,
            appliedEvents: { $not: { $elemMatch: { id: event.data.eventId } } }
          }, {
            $set: {
              status: { tag: 'rejected', rejectedAt: event.data.createdAt },
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