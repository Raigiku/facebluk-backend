import { CMD } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginCallback, RouteShorthandOptions } from 'fastify'
import { businessRuleErrorResponseSchema } from '../common'

export const cancelFriendRequestRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post<{ Body: Static<typeof bodySchema> }>(
    '/cancel/v1',
    routeOptions,
    async (request, reply) => {
      const jwt: Infra.User.JwtModel = await request.jwtVerify()
      await CMD.CancelFriendRequest.handle(
        {
          id: request.id,
          friendRequestId: request.body.friendRequestId,
          userId: jwt.sub,
        },
        {
          cancelFriendRequest: Infra.FriendRequest.cancel(request.postgreSqlPoolClient),
          findFriendRequestById: Infra.FriendRequest.findOneById(fastify.postgreSqlPool),
          publishEvent: Infra.Event.publishEvent(
            request.rabbitMqChannel,
            request.postgreSqlPoolClient
          ),
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
