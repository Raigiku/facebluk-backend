import { CMD, Post, Uuid } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginCallback, RouteShorthandOptions } from 'fastify'
import Joi from 'joi/lib'
import { businessRuleErrorResponseSchema } from '../common'

export const createPostRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post<{ Body: BodyType }>('/create/v1', routeOptions, async (request, reply) => {
    await syntaxValidator.validateAsync(request.body)
    const postId = Uuid.create()
    void CMD.CreatePost.handle(
      {
        requestId: request.id,
        postId,
        description: request.body.description,
        userId: request.userId!,
        taggedUserIds: request.body.taggedUserIds,
      },
      {
        createPost: Infra.Post.create(request.postgreSqlPoolClient),
        publishEvent: Infra.Event.publishEvent(
          request.rabbitMqChannel,
          request.postgreSqlPoolClient
        ),
      }
    ).catch((e) => {
      fastify.cLog('error', request.id, 'fail', request.userId, e)
    })

    await reply.status(200).send({ postId })
  })
  done()
}

const syntaxValidator = Joi.object<BodyType, true>({
  description: Post.descriptionValidator.required(),
  taggedUserIds: Post.taggedUserIdsValidator.required(),
})

type BodyType = Static<typeof bodySchema>
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
