import { Db } from 'mongodb'
import { FriendRequest as FriendRequestInfra, User as UserInfra } from '../..'
import { FriendRequest } from '@facebluk/domain'

export const applySentEvent =
  (fromUser: UserInfra.MongoDB.Document, toUser: UserInfra.MongoDB.Document, mongoDb: Db) =>
    async (event: FriendRequest.SentEvent) => {
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
            },
            appliedEvents: [
              {
                id: event.data.eventId,
                createdAt: event.data.createdAt,
                tag: event.payload.tag,
                appliedAt: new Date(),
              }
            ]
          }
        }, {
          upsert: true
        })
    }