import { CMD, Uuid } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginCallback, RouteShorthandOptions } from 'fastify'
import { businessRuleErrorResponseSchema } from '../common'

export const sendFriendRequestRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post<{ Body: Static<typeof bodySchema> }>(
    '/send-friend-request/v1',
    routeOptions,
    async (request, reply) => {
      const friendRequestId = Uuid.create()

      await CMD.SendFriendRequest.validate(
        request.id,
        {
          fromUserId: request.userAuthMetadata!.userId,
          toUserId: request.body.otherUserId,
        },
        {
          findUserById: Infra.User.Queries.PostgreSQL.findById(fastify.postgreSqlPool),
          findUserRelationship: Infra.UserRelationship.findBetweenUsers(fastify.postgreSqlPool),
          findLastFriendRequestBetweenUsers:
            Infra.FriendRequest.findLastFriendRequestBetweenUsers(fastify.postgreSqlPool),
        }
      )

      await Infra.Event.sendBrokerMsg(request.rabbitMqChannel)(
        request.id,
        CMD.SendFriendRequest.id,
        {
          requestId: request.id,
          fromUserId: request.userAuthMetadata!.userId,
          toUserId: request.body.otherUserId,
        } as CMD.SendFriendRequest.Request
      )

      await reply.status(200).send({ friendRequestId })
    }
  )
  done()
}

const bodySchema = Type.Object({
  otherUserId: Type.String({ minLength: 1, format: 'uuid' }),
})

const responseSchema = {
  200: {
    type: 'object',
    properties: {
      friendRequestId: { type: 'string' },
    },
  },
  ...businessRuleErrorResponseSchema,
}

const routeOptions: RouteShorthandOptions = {
  schema: {
    body: bodySchema,
    response: responseSchema,
  },
}
