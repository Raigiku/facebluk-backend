import { CMD, INT } from '@facebluk/domain'
import { Common } from '@facebluk/infra-common'
import { EventStore } from '@facebluk/infra-event-store'
import { MessageBroker } from '@facebluk/infra-message-broker'
import { UserAuth } from '@facebluk/infra-user-auth'
import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginCallback, RouteShorthandOptions } from 'fastify'
import { businessRuleErrorResponseSchema } from '..'

export const unblockUserRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post<{ Body: Static<typeof bodySchema> }>('/unblock', routeOptions, async (request, reply) => {
    await CMD.UnblockUser.handle(
      {
        id: request.id,
        fromUserId: request.body.fromUserId,
        toUserId: request.body.toUserId,
      },
      {
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
  fromUserId: Type.String({ minLength: 1, format: 'uuid' }),
  toUserId: Type.String({ minLength: 1, format: 'uuid' }),
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
