import { CMD, INT } from '@facebluk/domain'
import { Common } from '@facebluk/infra-common'
import { EventStore } from '@facebluk/infra-event-store'
import { MessageBroker } from '@facebluk/infra-message-broker'
import { UserAuth } from '@facebluk/infra-user-auth'
import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginCallback, RouteShorthandOptions } from 'fastify'
import { businessRuleErrorResponseSchema } from '../common'

export const acceptFriendRequestRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post<{ Body: Static<typeof bodySchema> }>(
    '/accept',
    routeOptions,
    async (request, reply) => {
      const jwt: UserAuth.AuthJwt = await request.jwtVerify()
      await CMD.AcceptFriendRequest.handle(
        {
          id: request.id,
          userId: jwt.sub,
          friendRequestId: request.body.friendRequestId,
        },
        {
          log: Common.Logger.log(request.log),
          getUserRelationshipBetween: EventStore.Accessor.UserRelationship.getBetweenUsers(
            fastify.eventStoreConn
          ),
          getFriendRequest: EventStore.Accessor.FriendRequest.get(fastify.eventStoreConn),
          processEvents: INT.Event.processEvents(
            Common.Logger.log(request.log),
            EventStore.Accessor.Event.persistEvents(fastify.eventStoreConn),
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
