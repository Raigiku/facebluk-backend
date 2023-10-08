import { Db } from 'mongodb'
import { User as UserInfra } from '../../index'
import { Client } from '@elastic/elasticsearch'
import { User } from '@facebluk/domain'

export const applyRegisteredEvent =
  (mongoDb: Db, elasticClient: Client): User.Mutations.ApplyRegisteredEvent =>
    async (event, persistInDocumentDb, persistInTextSearchDb) => {
      if (persistInDocumentDb)
        await mongoDb
          .collection<UserInfra.MongoDB.Document>(UserInfra.MongoDB.collectionName)
          .insertOne({
            aggregate: { id: event.data.aggregateId, createdAt: event.data.createdAt },
            alias: event.payload.alias,
            name: event.payload.name,
            profilePictureUrl: event.payload.profilePictureUrl,
          })

      if (persistInTextSearchDb)
        await elasticClient.index<UserInfra.ElasticSeach.Document>({
          index: UserInfra.ElasticSeach.indexName,
          id: event.data.aggregateId,
          document: {
            createdAt: event.data.createdAt,
            alias: event.payload.alias,
            name: event.payload.name,
          },
        })
    }