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

    await Infra.Event.sendBrokerMsg(request.rabbitMqChannel, request.id, CMD.CreatePost.id, {
      requestId: request.id,
      postId,
      description: request.body.description,
      userId: request.userAuthMetadata!.id,
      taggedUserIds: request.body.taggedUserIds,
    } as CMD.CreatePost.Request)

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
