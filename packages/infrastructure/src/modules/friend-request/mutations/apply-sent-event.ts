import { Db } from 'mongodb'
import { FriendRequest as FriendRequestInfra, User as UserInfra } from '../..'
import { FriendRequest } from '@facebluk/domain'

export const applySentEvent =
  (fromUser: UserInfra.MongoDB.Document, toUser: UserInfra.MongoDB.Document, mongoDb: Db): FriendRequest.Mutations.ApplySentEvent =>
    async (event) => {
      await mongoDb
        .collection<FriendRequestInfra.MongoDB.Document>(FriendRequestInfra.MongoDB.collectionName)
        .updateOne({
          'aggregate.id': event.data.aggregateId,
        }, {
          $setOnInsert: {
            aggregate: { id: event.data.aggregateId, createdAt: event.data.createdAt },
            status: { tag: 'pending' },
            fromUser: {
              id: event.payload.fromUserId,
              alias: fromUser.alias,
              name: fromUser.name,
              profilePictureUrl: fromUser.profilePictureUrl
            },
            toUser: {
              id: event.payload.toUserId,
              alias: toUser.alias,
              name: toUser.name,
              profilePictureUrl: toUser.profilePictureUrl
            }
          }
        }, {
          upsert: true
        })
    }