import { Db } from 'mongodb'
import { UserRelationship as UserRelationshipInfra } from '../..'
import { UserRelationship } from '@facebluk/domain'

export const applyUnfriendedEvent =
  (mongoDb: Db) =>
    async (event: UserRelationship.UnfriendedUserEvent) => {
      await mongoDb
        .collection<UserRelationshipInfra.MongoDB.Document>(UserRelationshipInfra.MongoDB.collectionName)
        .updateOne({
          'aggregate.id': event.data.aggregateId,
          appliedEvents: { $not: { $elemMatch: { id: event.data.eventId } } }
        }, {
          $set: {
            friendStatus: {
              tag: 'unfriended',
              unfriendedAt: event.data.createdAt,
              fromUserId: event.payload.fromUserId,
              toUserId: event.payload.toUserId
            }
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