import { CMD } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { MsgConsumerFn, consumerHandler } from '..'

export const queueName = CMD.CreatePost.id

export const consume: MsgConsumerFn =
  (rabbitChannel, supabaseClient, pgPool, log) => async (msg) => {
    await consumerHandler<CMD.CreatePost.Request>(
      rabbitChannel,
      pgPool,
      log,
      msg,
      async (pgClient, cmd) => {
        await CMD.CreatePost.handle(cmd, {
          db_findPostCreatedEvent: Infra.Event.findEvent(pgPool),
          createPost: Infra.Post.create(pgClient),
          publishEvent: Infra.Event.publishEvent(rabbitChannel, pgClient),
        })
      }
    )
  }
