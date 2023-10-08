import { Infra } from '@facebluk/infrastructure'
import { CMD, FnLog, User } from '@facebluk/domain'
import { RegisterUser, UpdateUserInfo, UserRegistered } from './user'
import { CreatePost } from './post'
import {
  AcceptFriendRequest,
  CancelFriendRequest,
  RejectFriendRequest,
  SendFriendRequest,
} from './friend-request'
import { UnfriendUser } from './user-relationship'

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
  [User.RegisteredEvent.tag]: {
    exchange: User.RegisteredEvent.tag,
    consumer: UserRegistered.consume
  },
  [UpdateUserInfo.queueName]: {
    exchange: CMD.UpdateUserInfo.id,
    consumer: UpdateUserInfo.consume,
  },
  [CreatePost.queueName]: {
    exchange: CMD.CreatePost.id,
    consumer: CreatePost.consume,
  },
  [AcceptFriendRequest.queueName]: {
    exchange: CMD.AcceptFriendRequest.id,
    consumer: AcceptFriendRequest.consume,
  },
  [CancelFriendRequest.queueName]: {
    exchange: CMD.CancelFriendRequest.id,
    consumer: CancelFriendRequest.consume,
  },
  [RejectFriendRequest.queueName]: {
    exchange: CMD.RejectFriendRequest.id,
    consumer: RejectFriendRequest.consume,
  },
  [SendFriendRequest.queueName]: {
    exchange: CMD.SendFriendRequest.id,
    consumer: SendFriendRequest.consume,
  },
  [UnfriendUser.queueName]: {
    exchange: CMD.UnfriendUser.id,
    consumer: UnfriendUser.consume,
  },
}

export type MsgConsumerFn = (
  rabbitChannel: Infra.RabbitMQ.Channel,
  supabaseClient: Infra.Supabase.SupabaseClient,
  pgPool: Infra.PostgreSQL.Pool,
  log: FnLog,
  mongoDb: Infra.MongoDB.Db,
  elasticClient: Infra.ElasticSearch.Client,
) => (msg: Infra.RabbitMQ.ConsumeMessage | null) => void

export const consumerHandler = async <T>(
  rabbitChannel: Infra.RabbitMQ.Channel,
  pgPool: Infra.PostgreSQL.Pool,
  log: FnLog,
  msg: Infra.RabbitMQ.Message | null,
  handle: (pgClient: Infra.PostgreSQL.PoolClient, brokerMsg: T) => Promise<void>
) => {
  if (msg == null) {
    log('fatal', '', 'null msg')
    return
  }

  log('info', msg.properties.messageId, JSON.stringify(msg.fields))

  try {
    const parsedBrokerMsg = JSON.parse(msg.content.toString())
    const pgClient = await pgPool.connect()
    await handle(pgClient, parsedBrokerMsg)
    rabbitChannel.ack(msg)
  } catch (error) {
    if (error instanceof Error)
      log('error', msg.properties.messageId, 'unknown error consuming message', undefined, error)
    rabbitChannel.reject(msg, false)
  }
}
