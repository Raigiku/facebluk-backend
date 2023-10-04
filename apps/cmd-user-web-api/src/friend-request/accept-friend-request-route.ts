import { CMD } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginCallback, RouteShorthandOptions } from 'fastify'
import { businessRuleErrorResponseSchema } from '../common'

export const acceptFriendRequestRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post<{ Body: Static<typeof bodySchema> }>(
    '/accept-friend-request/v1',
    routeOptions,
    async (request, reply) => {
      const valRes = await CMD.AcceptFriendRequest.validate(
        request.id,
        {
          userId: request.userAuthMetadata!.userId,
          friendRequestId: request.body.friendRequestId,
        },
        {
          findFriendRequest: Infra.FriendRequest.findOneById(fastify.postgreSqlPool),
        }
      )

      await Infra.Event.sendBrokerMsg(request.rabbitMqChannel)(
        request.id,
        CMD.AcceptFriendRequest.id,
        {
          requestId: request.id,
          userId: request.userAuthMetadata!.userId,
          friendRequest: valRes.friendRequest,
        } as CMD.AcceptFriendRequest.Request
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
