import { Db } from 'mongodb'
import { FriendRequest as FriendRequestInfra } from '../..'
import { FriendRequest } from '@facebluk/domain'

export const applyCancelledEvent =
  (mongoDb: Db): FriendRequest.Mutations.ApplyCancelledEvent =>
    async (event) => {
      await mongoDb
        .collection<FriendRequestInfra.MongoDB.Document>(FriendRequestInfra.MongoDB.collectionName)
        .updateOne({
          'aggregate.id': event.data.aggregateId,
        }, {
          $set: {
            status: { tag: 'cancelled', cancelledAt: event.data.createdAt },
          }
        }, {
          upsert: false
        })
    }