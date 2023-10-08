import { Db } from 'mongodb'
import { Post as PostInfra } from '../..'
import { Post } from '@facebluk/domain'

export const applyCreatedEvent =
  (mongoDb: Db): Post.Mutations.ApplyCreatedEvent =>
    async (event) => {
      await mongoDb
        .collection<PostInfra.MongoDB.Document>(PostInfra.MongoDB.collectionName)
        .updateOne({
          'aggregate.id': event.data.aggregateId,
        }, {
          $setOnInsert: {
            aggregate: { id: event.data.aggregateId, createdAt: event.data.createdAt },
            description: event.payload.description,
            taggedUserIds: event.payload.taggedUserIds,
            userId: event.payload.userId
          }
        }, {
          upsert: true
        })
    }