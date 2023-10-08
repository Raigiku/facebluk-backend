import { FriendRequest } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { MsgConsumerFn, consumerHandler } from '..'

export const queueName = FriendRequest.AcceptedEvent.tag

export const consume: MsgConsumerFn =
  (rabbitChannel, _, pgPool, log, mongoDb) => async (msg) => {
    await consumerHandler<FriendRequest.AcceptedEvent>(
      rabbitChannel,
      pgPool,
      log,
      msg,
      async (_, event) => {
        await Infra.FriendRequest.Mutations.applyAcceptedEvent(mongoDb)(event)
      }
    )
  }
