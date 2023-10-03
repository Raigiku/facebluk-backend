import { CMD } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { MsgConsumerFn, consumerHandler } from '..'

export const queueName = CMD.RejectFriendRequest.id

export const consume: MsgConsumerFn =
  (rabbitChannel, supabaseClient, pgPool, log) => async (msg) => {
    await consumerHandler<CMD.CancelFriendRequest.Request>(
      rabbitChannel,
      pgPool,
      log,
      msg,
      async (pgClient, cmd) => {
        await CMD.CancelFriendRequest.handle(cmd, {
          db_findCancelledFriendRequestEvent: Infra.Event.findEvent(pgPool),
          cancelFriendRequest: Infra.FriendRequest.cancel(pgClient),
          publishEvent: Infra.Event.publishEvent(rabbitChannel, pgClient),
        })
      }
    )
  }
