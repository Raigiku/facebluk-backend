import { Infra } from '@facebluk/infrastructure'
import { Common } from '@facebluk/infra-common'
import { CMD, Logger } from '@facebluk/domain'
import { RegisterUser } from './user'

export type MsgConsumer = {
  [queue: string]: {
    exchange: string
    consumer: MsgConsumerFn
  }
}

export const queues: MsgConsumer = {
  [RegisterUser.queueName]: {
    exchange: CMD.RegisterUser.id,
    consumer: RegisterUser.consume,
  },
}

export type MsgConsumerFn = (
  rabbitChannel: Infra.RabbitMQ.Channel,
  supabaseClient: Infra.Supabase.SupabaseClient,
  pgPool: Infra.PostgreSQL.Pool,
  log: Logger.FnLog
) => (msg: Infra.RabbitMQ.ConsumeMessage | null) => void

export const consumerHandler = async <T>(
  rabbitChannel: Infra.RabbitMQ.Channel,
  pgPool: Infra.PostgreSQL.Pool,
  log: Logger.FnLog,
  msg: Infra.RabbitMQ.Message | null,
  handle: (pgClient: Infra.PostgreSQL.PoolClient, commandRequest: T) => Promise<void>
) => {
  if (msg == null) {
    log('fatal', '', 'null msg')
    return
  }

  log('info', msg.properties.messageId, JSON.stringify(msg.fields))

  try {
    const commandRequest = Common.JsonSerializer.deserialize<T>(msg.content.toString())
    const pgClient = await pgPool.connect()
    await handle(pgClient, commandRequest)
    rabbitChannel.ack(msg)
  } catch (error) {
    if (error instanceof Error)
      log('error', msg.properties.messageId, 'unknown error consuming message', undefined, error)
    rabbitChannel.reject(msg, false)
  }
}
