import { CMD } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { MsgConsumerFn, consumerHandler } from '..'

export const queueName = CMD.AcceptFriendRequest.id

export const consume: MsgConsumerFn =
  (rabbitChannel, supabaseClient, pgPool, log) => async (msg) => {
    await consumerHandler<CMD.AcceptFriendRequest.Request>(
      rabbitChannel,
      pgPool,
      log,
      msg,
      async (pgClient, cmd) => {
        await CMD.AcceptFriendRequest.handle(cmd, {
          db_findAcceptedFriendRequestEvent: Infra.Event.findEvent(pgPool),
          db_findUserRelationshipBetween: Infra.UserRelationship.Queries.PostgreSQL.findBetweenUsers(pgPool),
          acceptFriendRequest: Infra.FriendRequest.Mutations.accept(pgClient),
          publishEvent: Infra.Event.publishEvent(rabbitChannel, pgClient),
        })
      }
    )
  }
