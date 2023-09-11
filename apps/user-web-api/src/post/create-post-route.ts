import { CMD, Post } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginCallback, RouteShorthandOptions } from 'fastify'
import { businessRuleErrorResponseSchema } from '../common'

export const createPostRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post<{ Body: Static<typeof bodySchema> }>(
    '/create/v1',
    routeOptions,
    async (request, reply) => {
      const jwt: Infra.User.JwtModel = await request.jwtVerify()
      const response = await CMD.CreatePost.handle(
        {
          id: request.id,
          description: request.body.description,
          userId: jwt.sub,
          taggedUserIds: request.body.taggedUserIds,
        },
        {
          createPost: Infra.Post.create(request.postgreSqlPoolClient),
          publishEvent: Infra.Event.publishEvent(
            request.rabbitMqChannel,
            request.postgreSqlPoolClient
          ),
        }
      )
      await reply.status(200).send(response)
    }
  )
  done()
}

const bodySchema = Type.Object({
  description: Type.String({ minLength: 1, maxLength: Post.descriptionMaxLength }),
  taggedUserIds: Type.Array(Type.String({ minLength: 1 }), {
    uniqueItems: true,
    maxItems: 20,
  }),
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
