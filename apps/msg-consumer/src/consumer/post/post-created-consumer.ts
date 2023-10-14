import { Post } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { MsgConsumerFn, consumerHandler } from '..'

export const queueName = Post.CreatedEvent.tag

export const consume: MsgConsumerFn =
  (rabbitChannel, supabaseClient, pgPool, log, mongoDb, elasticClient, redisClient) => async (msg) => {
    await consumerHandler<Post.CreatedEvent>(
      rabbitChannel,
      pgPool,
      log,
      msg,
      async (_, event) => {
        await Infra.Post.Mutations.applyCreatedEvent(mongoDb, redisClient)(event)
      }
    )
  }
