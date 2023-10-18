import { Infra } from '@facebluk/infrastructure'
import { CMD, FnLog, FriendRequest, Post, User, UserRelationship, jsonDeserialize } from '@facebluk/domain'
import { RegisterUser, UpdateUserInfo, UserInfoUpdated, UserRegistered } from './user'
import { CreatePost, PostCreated } from './post'
import {
  AcceptFriendRequest,
  CancelFriendRequest,
  FriendRequestAccepted,
  FriendRequestCancelled,
  FriendRequestRejected,
  FriendRequestSent,
  RejectFriendRequest,
  SendFriendRequest,
} from './friend-request'
import { UnfriendUser, UserUnfriended } from './user-relationship'

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
  [UserRegistered.queueName]: {
    exchange: User.RegisteredEvent.tag,
    consumer: UserRegistered.consume
  },

  [UpdateUserInfo.queueName]: {
    exchange: CMD.UpdateUserInfo.id,
    consumer: UpdateUserInfo.consume,
  },
  [UserInfoUpdated.queueName]: {
    exchange: User.InfoUpdatedEvent.tag,
    consumer: UserInfoUpdated.consume,
  },

  [CreatePost.queueName]: {
    exchange: CMD.CreatePost.id,
    consumer: CreatePost.consume,
  },
  [PostCreated.queueName]: {
    exchange: Post.CreatedEvent.tag,
    consumer: PostCreated.consume,
  },

  [AcceptFriendRequest.queueName]: {
    exchange: CMD.AcceptFriendRequest.id,
    consumer: AcceptFriendRequest.consume,
  },
  [FriendRequestAccepted.queueName]: {
    exchange: FriendRequest.AcceptedEvent.tag,
    consumer: FriendRequestAccepted.consume,
  },

  [CancelFriendRequest.queueName]: {
    exchange: CMD.CancelFriendRequest.id,
    consumer: CancelFriendRequest.consume,
  },
  [FriendRequestCancelled.queueName]: {
    exchange: FriendRequest.CancelledEvent.tag,
    consumer: FriendRequestCancelled.consume,
  },

  [RejectFriendRequest.queueName]: {
    exchange: CMD.RejectFriendRequest.id,
    consumer: RejectFriendRequest.consume,
  },
  [FriendRequestRejected.queueName]: {
    exchange: FriendRequest.RejectedEvent.tag,
    consumer: FriendRequestRejected.consume,
  },

  [SendFriendRequest.queueName]: {
    exchange: CMD.SendFriendRequest.id,
    consumer: SendFriendRequest.consume,
  },
  [FriendRequestSent.queueName]: {
    exchange: FriendRequest.SentEvent.tag,
    consumer: FriendRequestSent.consume,
  },

  [UnfriendUser.queueName]: {
    exchange: CMD.UnfriendUser.id,
    consumer: UnfriendUser.consume,
  },
  [UserUnfriended.queueName]: {
    exchange: UserRelationship.UnfriendedUserEvent.tag,
    consumer: UserUnfriended.consume,
  },
}

export type MsgConsumerFn = (
  rabbitChannel: Infra.RabbitMQ.Channel,
  supabaseClient: Infra.Supabase.SupabaseClient,
  pgPool: Infra.PostgreSQL.Pool,
  log: FnLog,
  mongoDb: Infra.MongoDB.Db,
  elasticClient: Infra.ElasticSearch.Client,
  redisClient: Infra.Redis.RedisClientType
) => (msg: Infra.RabbitMQ.ConsumeMessage | null) => void

export const consumerHandler = async <T>(
  rabbitChannel: Infra.RabbitMQ.Channel,
  pgPool: Infra.PostgreSQL.Pool,
  log: FnLog,
  msg: Infra.RabbitMQ.Message | null,
  handle: (pgClient: Infra.PostgreSQL.PoolClient, brokerMsg: T) => Promise<void>
) => {
  if (msg == null) {
    void log('fatal', '', 'null msg')
    return
  }

  void log('info', msg.properties.messageId, JSON.stringify(msg.fields))

  try {
    const parsedBrokerMsg = jsonDeserialize(msg.content.toString())
    const pgClient = await pgPool.connect()
    await handle(pgClient, parsedBrokerMsg)
    rabbitChannel.ack(msg)
  } catch (error) {
    if (error instanceof Error)
      void log('error', msg.properties.messageId, 'unknown error consuming message', undefined, error)
    rabbitChannel.reject(msg, false)
  }
}
