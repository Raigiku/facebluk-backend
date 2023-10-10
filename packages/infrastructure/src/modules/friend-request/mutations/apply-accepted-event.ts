import { Db } from 'mongodb'
import { FriendRequest as FriendRequestInfra } from '../..'
import { UserRelationship as UserRelationshipInfra } from '../..'
import { FriendRequest } from '@facebluk/domain'

export const applyAcceptedEvent =
  (friendRequest: FriendRequestInfra.MongoDB.Document, mongoDb: Db): FriendRequest.Mutations.ApplyAcceptedEvent =>
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

      await mongoDb
        .collection<UserRelationshipInfra.MongoDB.Document>(UserRelationshipInfra.MongoDB.collectionName)
        .updateOne({
          'aggregate.id': event.data.aggregateId
        }, {
          $set: {
            friendStatus: {
              tag: 'friended',
              friendedAt: event.data.createdAt,
              fromUserId: friendRequest.fromUser.id,
              toUserId: friendRequest.toUser.id
            }
          }
        }, {
          upsert: true
        })
    }