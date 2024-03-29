import { Db } from 'mongodb'
import { User as UserInfra } from '../..'
import { Client, errors } from '@elastic/elasticsearch'
import { User } from '@facebluk/domain'

export const applyRegisteredEvent =
  (mongoDb: Db, elasticClient: Client) =>
    async (event: User.RegisteredEvent) => {
      await mongoDb
        .collection<UserInfra.MongoDB.Document>(UserInfra.MongoDB.collectionName)
        .updateOne({
          'aggregate.id': event.data.aggregateId,
        }, {
          $setOnInsert: {
            aggregate: { id: event.data.aggregateId, createdAt: event.data.createdAt },
            alias: event.payload.alias,
            name: event.payload.name,
            profilePictureUrl: event.payload.profilePictureUrl,
            appliedEvents: [
              {
                id: event.data.eventId,
                createdAt: event.data.createdAt,
                tag: event.payload.tag,
                appliedAt: new Date()
              }
            ]
          }
        }, {
          upsert: true
        })

      try {
        await elasticClient.index<UserInfra.ElasticSeach.Document>({
          index: UserInfra.ElasticSeach.indexName,
          id: event.data.aggregateId,
          document: {
            createdAt: event.data.createdAt,
            alias: event.payload.alias,
            name: event.payload.name,
            appliedEvents: [
              {
                id: event.data.eventId,
                createdAt: event.data.createdAt,
                tag: event.payload.tag,
                appliedAt: new Date()
              }
            ]
          },
          op_type: 'create'
        })
      } catch (error) {
        if (error instanceof errors.ResponseError)
          if (error.meta.statusCode !== 409)
            throw error
      }
    }