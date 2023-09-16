import { CMD } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginCallback, RouteShorthandOptions } from 'fastify'
import { businessRuleErrorResponseSchema } from '../common'

export const rejectFriendRequestRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post<{ Body: Static<typeof bodySchema> }>(
    '/reject-friend-request/v1',
    routeOptions,
    async (request, reply) => {
      const jwt: Infra.User.JwtModel = await request.jwtVerify()
      await CMD.RejectFriendRequest.handle(
        {
          id: request.id,
          friendRequestId: request.body.friendRequestId,
          userId: jwt.sub,
        },
        {
          findFriendRequestById: Infra.FriendRequest.findOneById(fastify.postgreSqlPool),
          publishEvent: Infra.Event.publishEvent(
            request.rabbitMqChannel,
            request.postgreSqlPoolClient
          ),
          rejectFriendRequest: Infra.FriendRequest.reject(request.postgreSqlPoolClient),
        }
      )
      await reply.status(200).send()
    }
  )
  done()
}

const bodySchema = Type.Object({
  friendRequestId: Type.String({ minLength: 1, format: 'uuid' }),
})

const responseSchema = {
  200: {
    type: 'object',
  },
  ...businessRuleErrorResponseSchema,
}

const routeOptions: RouteShorthandOptions = {
  schema: {
    body: bodySchema,
    response: responseSchema,
  },
}
