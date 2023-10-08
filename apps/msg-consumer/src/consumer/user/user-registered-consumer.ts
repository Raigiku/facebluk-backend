import { CMD, User } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { MsgConsumerFn, consumerHandler } from '..'

export const queueName = CMD.RegisterUser.id

export const consume: MsgConsumerFn =
  (rabbitChannel, _, pgPool, log, mongoDb, elasticClient) => async (msg) => {
    await consumerHandler<User.RegisteredEvent>(
      rabbitChannel,
      pgPool,
      log,
      msg,
      async (_, event) => {
        const mongoUser = await Infra.User.Queries.MongoDb.findById(mongoDb)(event.data.aggregateId)
        const elasticUser = await Infra.User.Queries.ElasticSearch.findById(elasticClient)(event.data.aggregateId)
        await Infra.User.Mutations.applyRegisteredEvent(mongoDb, elasticClient)(event, mongoUser == null, elasticUser._source == null)
      }
    )
  }
