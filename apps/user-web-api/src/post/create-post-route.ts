import { CMD, ES, INT } from '@facebluk/domain'
import { PostgreSQL } from '@facebluk/infra-postgresql'
import { RabbitMQ } from '@facebluk/infra-rabbitmq'
import { Supabase } from '@facebluk/infra-supabase'
import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginCallback, RouteShorthandOptions } from 'fastify'
import { businessRuleErrorResponseSchema } from '../common'

export const createPostRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post<{ Body: Static<typeof bodySchema> }>(
    '/create',
    routeOptions,
    async (request, reply) => {
      const jwt: Supabase.UserAuth.User.JwtModel = await request.jwtVerify()
      const response = await CMD.CreatePost.handle(
        {
          id: request.id,
          description: request.body.description,
          userId: jwt.sub,
        },
        {
          processEvent: INT.Event.processEvent(
            PostgreSQL.Common.persistEvent(fastify.postgreSqlConn),
            RabbitMQ.publishEvent(request.rabbitmqChannel),
            PostgreSQL.Common.markEventAsSent(fastify.postgreSqlConn)
          ),
        }
      )
      await reply.status(200).send(response)
    }
  )
  done()
}

const bodySchema = Type.Object({
  description: Type.String({ minLength: 1, maxLength: ES.Post.descriptionMaxLength }),
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
