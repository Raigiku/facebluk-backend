import { CMD } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { MsgConsumerFn, consumerHandler } from '..'

export const queueName = CMD.UpdateUserInfo.id

export const consume: MsgConsumerFn =
  (rabbitChannel, supabaseClient, pgPool, log) => async (msg) => {
    await consumerHandler<CMD.UpdateUserInfo.Request>(
      rabbitChannel,
      pgPool,
      log,
      msg,
      async (pgClient, cmd) => {
        await CMD.UpdateUserInfo.handle(cmd, {
          db_findInfoUpdatedEvent: Infra.Event.findEvent(pgPool),
          updateUserInfo: Infra.User.Mutations.updateInfo(pgClient),
          publishEvent: Infra.Event.publishEvent(rabbitChannel, pgClient),
        })
      }
    )
  }
