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
        const friendRequest = await mongoDb
          .collection<Infra.FriendRequest.MongoDB.Document>(Infra.FriendRequest.MongoDB.collectionName)
          .findOne({
            'aggregate.id': event.data.aggregateId
          })
        if (friendRequest == null)
          throw new Error('friend request does not exist')

        await Infra.FriendRequest.Mutations.applyAcceptedEvent(friendRequest, mongoDb)(event)
      }
    )
  }
