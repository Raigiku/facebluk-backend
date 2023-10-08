import { FriendRequest } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { MsgConsumerFn, consumerHandler } from '..'

export const queueName = FriendRequest.CancelledEvent.tag

export const consume: MsgConsumerFn =
  (rabbitChannel, _, pgPool, log, mongoDb) => async (msg) => {
    await consumerHandler<FriendRequest.CancelledEvent>(
      rabbitChannel,
      pgPool,
      log,
      msg,
      async (_, event) => {
        await Infra.FriendRequest.Mutations.applyCancelledEvent(mongoDb)(event)
      }
    )
  }
