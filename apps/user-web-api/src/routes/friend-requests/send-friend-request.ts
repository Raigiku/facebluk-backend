import { CMD, INT } from '@facebluk/domain'
import { Common } from '@facebluk/infra-common'
import { EventStore } from '@facebluk/infra-event-store'
import { MessageBroker } from '@facebluk/infra-message-broker'
import { UserAuth } from '@facebluk/infra-user-auth'
import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginCallback, RouteShorthandOptions } from 'fastify'
import { businessRuleErrorResponseSchema } from '..'

export const sendFriendRequestRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post<{ Body: Static<typeof bodySchema> }>('/send', routeOptions, async (request, reply) => {
    const response = await CMD.SendFriendRequest.handle(
      {
        id: request.id,
        fromUserId: request.body.fromUserId,
        toUserId: request.body.toUserId,
      },
      {
        getUserById: UserAuth.Accessor.getUserById(fastify.userAuthConn, Common.Logger.log(request.log), request.id),
        getLastFriendRequestBetweenUsers: EventStore.Accessor.FriendRequest.getLastFriendRequestBetweenUsers(
          fastify.eventStoreConn
        ),
        getUserRelationship: EventStore.Accessor.UserRelationship.getBetweenUsers(fastify.eventStoreConn),
        processEvent: INT.Event.processEvent(
          EventStore.Accessor.Event.persistEvent(fastify.eventStoreConn),
          MessageBroker.publishEvent(request.msgBrokerChannel),
          EventStore.Accessor.Event.markEventAsSent(fastify.eventStoreConn)
        ),
      }
    )
    await reply.status(200).send(response)
  })
  done()
}

const bodySchema = Type.Object({
  fromUserId: Type.String({ minLength: 1, format: 'uuid' }),
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
