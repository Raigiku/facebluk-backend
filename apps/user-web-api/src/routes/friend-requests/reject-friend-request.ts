import { CMD, INT } from '@facebluk/domain'
import { Common } from '@facebluk/infra-common'
import { EventStore } from '@facebluk/infra-event-store'
import { MessageBroker } from '@facebluk/infra-message-broker'
import { UserAuth } from '@facebluk/infra-user-auth'
import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginCallback, RouteShorthandOptions } from 'fastify'
import { businessRuleErrorResponseSchema } from '..'

export const rejectFriendRequestRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post<{ Body: Static<typeof bodySchema> }>('/reject', routeOptions, async (request, reply) => {
    await CMD.RejectFriendRequest.handle(
      {
        id: request.id,
        friendRequestId: request.body.friendRequestId,
        userId: request.body.userId,
      },
      {
        getFriendRequestById: EventStore.Accessor.FriendRequest.get(fastify.eventStoreConn),
        processEvent: INT.Event.processEvent(
          EventStore.Accessor.Event.persistEvent(fastify.eventStoreConn),
          MessageBroker.publishEvent(request.msgBrokerChannel),
          EventStore.Accessor.Event.markEventAsSent(fastify.eventStoreConn)
        ),
        getUserById: UserAuth.Accessor.getUserById(fastify.userAuthConn, Common.Logger.log(request.log), request.id),
      }
    )
    await reply.status(200).send()
  })
  done()
}

const bodySchema = Type.Object({
  userId: Type.String({ minLength: 1, format: 'uuid' }),
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
