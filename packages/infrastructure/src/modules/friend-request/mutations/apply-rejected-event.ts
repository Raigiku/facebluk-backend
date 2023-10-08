import { Db } from 'mongodb'
import { FriendRequest as FriendRequestInfra } from '../..'
import { FriendRequest } from '@facebluk/domain'

export const applyRejectedEvent =
  (mongoDb: Db): FriendRequest.Mutations.ApplyRejectedEvent =>
    async (event) => {
      await mongoDb
        .collection<FriendRequestInfra.MongoDB.Document>(FriendRequestInfra.MongoDB.collectionName)
        .updateOne({
          'aggregate.id': event.data.aggregateId,
        }, {
          $set: {
            status: { tag: 'rejected', rejectedAt: event.data.createdAt },
          }
        }, {
          upsert: false
        })
    }