import { CMD } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { MsgConsumerFn, consumerHandler } from '..'

export const queueName = CMD.SendFriendRequest.id

export const consume: MsgConsumerFn =
  (rabbitChannel, supabaseClient, pgPool, log) => async (msg) => {
    await consumerHandler<CMD.SendFriendRequest.Request>(
      rabbitChannel,
      pgPool,
      log,
      msg,
      async (pgClient, cmd) => {
        await CMD.SendFriendRequest.handle(cmd, {
          db_findFriendRequestSentEvent: Infra.Event.findEvent(pgPool),
          sendFriendRequest: Infra.FriendRequest.send(pgClient),
          publishEvent: Infra.Event.publishEvent(rabbitChannel, pgClient),
        })
      }
    )
  }
