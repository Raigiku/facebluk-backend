import { User } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { MsgConsumerFn, consumerHandler } from '..'

export const queueName = User.RegisteredEvent.tag

export const consume: MsgConsumerFn =
  (rabbitChannel, _, pgPool, log, mongoDb, elasticClient) => async (msg) => {
    await consumerHandler<User.RegisteredEvent>(
      rabbitChannel,
      pgPool,
      log,
      msg,
      async (_, event) => {
        await Infra.User.Mutations.applyRegisteredEvent(mongoDb, elasticClient)(event)
      }
    )
  }
