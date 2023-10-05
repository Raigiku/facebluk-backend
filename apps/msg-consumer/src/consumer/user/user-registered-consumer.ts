import { CMD } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { MsgConsumerFn, consumerHandler } from '..'

export const queueName = CMD.RegisterUser.id

export const consume: MsgConsumerFn =
  (rabbitChannel, supabaseClient, pgPool, log) => async (msg) => {
    await consumerHandler<CMD.RegisterUser.Request>(
      rabbitChannel,
      pgPool,
      log,
      msg,
      async (pgClient, cmd) => {
        
      }
    )
  }
