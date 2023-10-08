import { Db } from 'mongodb'
import { UserRelationship as UserRelationshipInfra } from '../..'
import { UserRelationship } from '@facebluk/domain'

export const applyUnfriendedEvent =
  (mongoDb: Db): UserRelationship.Mutations.ApplyUnfriendEvent =>
    async (event) => {
      await mongoDb
        .collection<UserRelationshipInfra.MongoDB.Document>(UserRelationshipInfra.MongoDB.collectionName)
        .updateOne({
          'aggregate.id': event.data.aggregateId
        }, {
          $set: {
            friendStatus: {
              tag: 'unfriended',
              unfriendedAt: event.data.createdAt,
              fromUserId: event.payload.fromUserId,
              toUserId: event.payload.toUserId
            }
          }
        }, {
          upsert: false
        })
    }