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
          fromUserId: request.userAuthMetadata!.id,
          toUserId: request.body.otherUserId,
        },
        {
          findUserById: Infra.User.findOneById(fastify.postgreSqlPool),
          findUserRelationship: Infra.UserRelationship.findOneBetweenUsers(fastify.postgreSqlPool),
          findLastFriendRequestBetweenUsers:
            Infra.FriendRequest.findOneLastFriendRequestBetweenUsers(fastify.postgreSqlPool),
        }
      )

      await Infra.Event.sendBrokerMsg<CMD.SendFriendRequest.Request>(
        request.rabbitMqChannel,
        request.id,
        CMD.SendFriendRequest.id,
        {
          requestId: request.id,
          fromUserId: request.userAuthMetadata!.id,
          toUserId: request.body.otherUserId,
        }
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
