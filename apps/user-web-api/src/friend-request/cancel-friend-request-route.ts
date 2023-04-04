import { CMD, INT } from '@facebluk/domain'
import { EventStore } from '@facebluk/infra-event-store'
import { MessageBroker } from '@facebluk/infra-message-broker'
import { UserAuth } from '@facebluk/infra-user-auth'
import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginCallback, RouteShorthandOptions } from 'fastify'
import { businessRuleErrorResponseSchema } from '../common'

export const cancelFriendRequestRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post<{ Body: Static<typeof bodySchema> }>(
    '/cancel',
    routeOptions,
    async (request, reply) => {
      const jwt: UserAuth.AuthJwt = await request.jwtVerify()
      await CMD.CancelFriendRequest.handle(
        {
          id: request.id,
          friendRequestId: request.body.friendRequestId,
          userId: jwt.sub,
        },
        {
          getFriendRequestById: EventStore.Accessor.FriendRequest.get(fastify.eventStoreConn),
          processEvent: INT.Event.processEvent(
            EventStore.Accessor.Event.persistEvent(fastify.eventStoreConn),
            MessageBroker.publishEvent(request.msgBrokerChannel),
            EventStore.Accessor.Event.markEventAsSent(fastify.eventStoreConn)
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
