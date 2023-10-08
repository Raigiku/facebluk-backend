import { FriendRequest } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { MsgConsumerFn, consumerHandler } from '..'

export const queueName = FriendRequest.RejectedEvent.tag

export const consume: MsgConsumerFn =
  (rabbitChannel, _, pgPool, log, mongoDb) => async (msg) => {
    await consumerHandler<FriendRequest.RejectedEvent>(
      rabbitChannel,
      pgPool,
      log,
      msg,
      async (_, event) => {
        await Infra.FriendRequest.Mutations.applyRejectedEvent(mongoDb)(event)
      }
    )
  }
