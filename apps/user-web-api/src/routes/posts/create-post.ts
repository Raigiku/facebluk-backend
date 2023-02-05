import { CMD, ES, INT, Uuid } from '@facebluk/domain'
import { EventStore } from '@facebluk/infra-event-store'
import { MessageBroker } from '@facebluk/infra-message-broker'
import { UserAuth } from '@facebluk/infra-user-auth'
import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginCallback, RouteShorthandOptions } from 'fastify'
import { businessRuleErrorResponseSchema } from '..'

export const createPostRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post<{ Body: Static<typeof bodySchema> }>('/create', routeOptions, async (request, reply) => {
    const qwe = request.log
    await CMD.CreatePost.handle(
      {
        requestId: Uuid.newA(),
        description: request.body.description,
        userId: request.body.userId,
      },
      {
        getUserById: UserAuth.Accessor.getUserById(fastify.userAuthConn),
        processEvent: INT.Event.processEvent(
          EventStore.Accessor.Event.persistEvent(fastify.eventStoreConn),
          MessageBroker.publishEvent(request.msgBrokerChannel),
          EventStore.Accessor.Event.markEventAsSent(fastify.eventStoreConn)
        ),
      }
    )
    await reply.status(200).send()
  })
  done()
}

const bodySchema = Type.Object({
  description: Type.String({ minLength: 1, maxLength: ES.Post.DESCRIPTION_MAX_LENGTH }),
  userId: Type.String({ minLength: 1 }),
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
