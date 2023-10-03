import { CMD } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { MsgConsumerFn, consumerHandler } from '..'

export const queueName = CMD.UnfriendUser.id

export const consume: MsgConsumerFn =
  (rabbitChannel, supabaseClient, pgPool, log) => async (msg) => {
    await consumerHandler<CMD.UnfriendUser.Request>(
      rabbitChannel,
      pgPool,
      log,
      msg,
      async (pgClient, cmd) => {
        await CMD.UnfriendUser.handle(cmd, {
          db_findUnfriendedEvent: Infra.Event.findEvent(pgPool),
          unfriend: Infra.UserRelationship.unfriend(pgClient),
          publishEvent: Infra.Event.publishEvent(rabbitChannel, pgClient),
        })
      }
    )
  }
