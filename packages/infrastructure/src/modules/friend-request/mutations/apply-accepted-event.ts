import { Db } from 'mongodb'
import { FriendRequest as FriendRequestInfra } from '../..'
import { FriendRequest } from '@facebluk/domain'

export const applyAcceptedEvent =
  (mongoDb: Db): FriendRequest.Mutations.ApplyAcceptedEvent =>
    async (event) => {
      await mongoDb
        .collection<FriendRequestInfra.MongoDB.Document>(FriendRequestInfra.MongoDB.collectionName)
        .updateOne({
          'aggregate.id': event.data.aggregateId,
        }, {
          $set: {
            status: { tag: 'accepted', acceptedAt: event.data.createdAt },
          }
        }, {
          upsert: false
        })
    }