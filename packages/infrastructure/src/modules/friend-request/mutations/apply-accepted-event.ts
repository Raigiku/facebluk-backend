import { Db } from 'mongodb'
import { FriendRequest as FriendRequestInfra } from '../..'
import { UserRelationship as UserRelationshipInfra } from '../..'
import { FriendRequest } from '@facebluk/domain'

export const applyAcceptedEvent =
  (friendRequest: FriendRequestInfra.MongoDB.Document, mongoDb: Db) =>
    async (event: FriendRequest.AcceptedEvent) => {
      await mongoDb
        .collection<FriendRequestInfra.MongoDB.Document>(FriendRequestInfra.MongoDB.collectionName)
        .updateOne({
          'aggregate.id': event.data.aggregateId,
          appliedEvents: { $not: { $elemMatch: { id: event.data.eventId } } }
        }, {
          $set: {
            status: { tag: 'accepted', acceptedAt: event.data.createdAt },
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

      await mongoDb
        .collection<UserRelationshipInfra.MongoDB.Document>(UserRelationshipInfra.MongoDB.collectionName)
        .updateOne({
          'aggregate.id': event.data.aggregateId,
          appliedEvents: { $not: { $elemMatch: { id: event.data.eventId } } }
        }, {
          $set: {
            friendStatus: {
              tag: 'friended',
              friendedAt: event.data.createdAt,
              fromUserId: friendRequest.fromUser.id,
              toUserId: friendRequest.toUser.id
            },
          },
          $addToSet: {
            appliedEvents: {
              id: event.data.eventId,
              createdAt: event.data.createdAt,
              tag: event.payload.tag,
              appliedAt: new Date(),
            }
          }
        }, {
          upsert: true
        })
    }