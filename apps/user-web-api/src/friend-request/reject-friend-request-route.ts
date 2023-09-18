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
      const valRes = await CMD.RejectFriendRequest.validate(
        request.id,
        {
          friendRequestId: request.body.friendRequestId,
          userId: request.userAuthMetadata!.id,
        },
        {
          findFriendRequest: Infra.FriendRequest.findOneById(fastify.postgreSqlPool),
        }
      )

      await Infra.Event.sendBrokerMsg(request.rabbitMqChannel)(
        request.id,
        CMD.RejectFriendRequest.id,
        {
          requestId: request.id,
          friendRequest: valRes.friendRequest,
        } as CMD.RejectFriendRequest.Request
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
