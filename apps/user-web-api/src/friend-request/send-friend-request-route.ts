import { CMD } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginCallback, RouteShorthandOptions } from 'fastify'
import { businessRuleErrorResponseSchema } from '../common'

export const sendFriendRequestRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post<{ Body: Static<typeof bodySchema> }>(
    '/send-friend-request/v1',
    routeOptions,
    async (request, reply) => {
      const jwt: Infra.User.JwtModel = await request.jwtVerify()
      const response = await CMD.SendFriendRequest.handle(
        {
          id: request.id,
          userId: jwt.sub,
          toUserId: request.body.toUserId,
        },
        {
          findUserById: Infra.User.findOneById(fastify.postgreSqlPool),
          publishEvent: Infra.Event.publishEvent(
            request.rabbitMqChannel,
            request.postgreSqlPoolClient
          ),
          sendFriendRequest: Infra.FriendRequest.send(request.postgreSqlPoolClient),
          findUserRelationship: Infra.UserRelationship.findOneBetweenUsers(fastify.postgreSqlPool),
          findLastFriendRequestBetweenUsers:
            Infra.FriendRequest.findOneLastFriendRequestBetweenUsers(fastify.postgreSqlPool),
        }
      )
      await reply.status(200).send(response)
    }
  )
  done()
}

const bodySchema = Type.Object({
  toUserId: Type.String({ minLength: 1, format: 'uuid' }),
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
