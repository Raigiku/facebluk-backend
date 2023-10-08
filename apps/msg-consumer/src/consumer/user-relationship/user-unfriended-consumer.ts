import { UserRelationship } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { MsgConsumerFn, consumerHandler } from '..'

export const queueName = UserRelationship.UnfriendedUserEvent.tag

export const consume: MsgConsumerFn =
  (rabbitChannel, _, pgPool, log, mongoDb) => async (msg) => {
    await consumerHandler<UserRelationship.UnfriendedUserEvent>(
      rabbitChannel,
      pgPool,
      log,
      msg,
      async (_, event) => {
          await Infra.UserRelationship.Mutations.applyUnfriendedEvent(mongoDb)(event)
      }
    )
  }
