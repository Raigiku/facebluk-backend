import { FriendRequest } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { MsgConsumerFn, consumerHandler } from '..'

export const queueName = FriendRequest.SentEvent.tag

export const consume: MsgConsumerFn =
  (rabbitChannel, _, pgPool, log, mongoDb) => async (msg) => {
    await consumerHandler<FriendRequest.SentEvent>(
      rabbitChannel,
      pgPool,
      log,
      msg,
      async (_, event) => {
        const fromUser = await mongoDb
          .collection<Infra.User.MongoDB.Document>(Infra.User.MongoDB.collectionName)
          .findOne({
            'aggregate.id': event.payload.fromUserId
          })
        if (fromUser == null)
          throw new Error('from user does not exist to apply friend request sent event')

        const toUser = await mongoDb
          .collection<Infra.User.MongoDB.Document>(Infra.User.MongoDB.collectionName)
          .findOne({
            'aggregate.id': event.payload.toUserId
          })
        if (toUser == null)
          throw new Error('to user does not exist to apply friend request sent event')

        await Infra.FriendRequest.Mutations.applySentEvent(fromUser, toUser, mongoDb)(event)
      }
    )
  }
