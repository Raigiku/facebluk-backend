import { CMD, ES, INT } from '@facebluk/domain'
import { Common } from '@facebluk/infra-common'
import { EventStore } from '@facebluk/infra-event-store'
import { MessageBroker } from '@facebluk/infra-message-broker'
import { UserAuth } from '@facebluk/infra-user-auth'
import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginCallback, RouteShorthandOptions } from 'fastify'
import { businessRuleErrorResponseSchema } from '..'

export const createPostRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post<{ Body: Static<typeof bodySchema> }>('/create', routeOptions, async (request, reply) => {
    const response = await CMD.CreatePost.handle(
      {
        id: request.id,
        description: request.body.description,
        userId: request.body.userId,
      },
      {
        getUserById: UserAuth.Accessor.getUserById(fastify.userAuthConn, Common.Logger.log(request.log), request.id),
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
  description: Type.String({ minLength: 1, maxLength: ES.Post.DESCRIPTION_MAX_LENGTH }),
  userId: Type.String({ minLength: 1, format: 'uuid' }),
})

const responseSchema = {
  200: {
    type: 'object',
    properties: {
      postId: { type: 'string' },
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
