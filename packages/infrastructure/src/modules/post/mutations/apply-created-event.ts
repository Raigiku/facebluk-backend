import { Db } from 'mongodb'
import { Post as PostInfra } from '../..'
import { Post } from '@facebluk/domain'
import { RedisClientType } from 'redis'

export const applyCreatedEvent =
  (mongoDb: Db, redisClient: RedisClientType) =>
    async (event: Post.CreatedEvent) => {
      await mongoDb
        .collection<PostInfra.MongoDB.Document>(PostInfra.MongoDB.collectionName)
        .updateOne({
          'aggregate.id': event.data.aggregateId,
        }, {
          $setOnInsert: {
            aggregate: { id: event.data.aggregateId, createdAt: event.data.createdAt },
            description: event.payload.description,
            taggedUserIds: event.payload.taggedUserIds,
            userId: event.payload.userId,
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

      const redisPost: PostInfra.Redis.Value = {
        aggregate: {
          id: event.data.aggregateId,
          createdAt: event.data.createdAt,
        },
        description: event.payload.description,
        taggedUserIds: event.payload.taggedUserIds,
        userId: event.payload.userId
      }
      const creationDateInEpochSeconds = Math.floor(redisPost.aggregate.createdAt.getTime() / 1000)
      await redisClient.zAdd(PostInfra.Redis.keyName, {
        score: creationDateInEpochSeconds,
        value: JSON.stringify(redisPost)
      })
    }