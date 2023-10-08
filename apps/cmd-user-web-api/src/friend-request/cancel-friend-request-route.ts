import { CMD } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginCallback, RouteShorthandOptions } from 'fastify'
import { businessRuleErrorResponseSchema } from '../common'

export const cancelFriendRequestRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post<{ Body: Static<typeof bodySchema> }>(
    '/cancel-friend-request/v1',
    routeOptions,
    async (request, reply) => {
      const valRes = await CMD.CancelFriendRequest.validate(
        request.id,
        {
          userId: request.userAuthMetadata!.userId,
          friendRequestId: request.body.friendRequestId,
        },
        { findFriendRequest: Infra.FriendRequest.Queries.PostgreSQL.findById(fastify.postgreSqlPool) }
      )

      await Infra.Event.sendBrokerMsg(request.rabbitMqChannel)(
        request.id,
        CMD.CancelFriendRequest.id,
        {
          requestId: request.id,
          friendRequest: valRes.friendRequest,
        } as CMD.CancelFriendRequest.Request
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
