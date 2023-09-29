import { CMD, Uuid } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginCallback, RouteShorthandOptions } from 'fastify'
import { businessRuleErrorResponseSchema } from '../common'

export const createPostRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post<{ Body: Static<typeof bodySchema> }>(
    '/create-post/v1',
    routeOptions,
    async (request, reply) => {
      await CMD.CreatePost.validate(request.body)

      const postId = Uuid.create()

      await Infra.Event.sendBrokerMsg(request.rabbitMqChannel)(request.id, CMD.CreatePost.id, {
        requestId: request.id,
        postId,
        description: request.body.description,
        userId: request.userAuthMetadata!.userId,
        taggedUserIds: request.body.taggedUserIds,
      } as CMD.CreatePost.Request)

      await reply.status(200).send({ postId })
    }
  )
  done()
}

const bodySchema = Type.Object({
  description: Type.String(),
  taggedUserIds: Type.Array(Type.String()),
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
