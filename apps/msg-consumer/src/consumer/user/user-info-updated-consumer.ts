import { User } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { MsgConsumerFn, consumerHandler } from '..'

export const queueName = User.InfoUpdatedEvent.tag

export const consume: MsgConsumerFn =
  (rabbitChannel, _, pgPool, log, mongoDb) => async (msg) => {
    await consumerHandler<User.InfoUpdatedEvent>(
      rabbitChannel,
      pgPool,
      log,
      msg,
      async (_, event) => {
        await Infra.User.Mutations.applyInfoUpdatedEvent(mongoDb)(event)
      }
    )
  }
