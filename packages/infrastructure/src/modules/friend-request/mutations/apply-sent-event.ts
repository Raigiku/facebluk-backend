import { Db } from 'mongodb'
import { FriendRequest as FriendRequestInfra, User as UserInfra } from '../..'
import { FriendRequest } from '@facebluk/domain'

export const applySentEvent =
  (mongoDb: Db): FriendRequest.Mutations.ApplySentEvent =>
    async (event) => {
      const fromUser = await mongoDb
        .collection<UserInfra.MongoDB.Document>(UserInfra.MongoDB.collectionName)
        .findOne({
          'aggregate.id': event.payload.fromUserId
        })
      if (fromUser == null)
        throw new Error('from user does not exist to apply friend request sent event')

      const toUser = await mongoDb
        .collection<UserInfra.MongoDB.Document>(UserInfra.MongoDB.collectionName)
        .findOne({
          'aggregate.id': event.payload.toUserId
        })
      if (toUser == null)
        throw new Error('to user does not exist to apply friend request sent event')

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