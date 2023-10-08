import { CMD, Post } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { MsgConsumerFn, consumerHandler } from '..'

export const queueName = CMD.CreatePost.id

export const consume: MsgConsumerFn =
  (rabbitChannel, _, pgPool, log, mongoDb) => async (msg) => {
    await consumerHandler<Post.CreatedEvent>(
      rabbitChannel,
      pgPool,
      log,
      msg,
      async (_, event) => {
        const mongoPost = await Infra.Post.Queries.MongoDb.findById(mongoDb)(event.data.aggregateId)
        if (mongoPost == null)
          await Infra.Post.Mutations.applyCreatedEvent(mongoDb)(event)
      }
    )
  }
