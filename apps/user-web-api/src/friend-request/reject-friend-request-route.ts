import { CMD, INT } from '@facebluk/domain'
import { PostgreSQL } from '@facebluk/infra-postgresql'
import { RabbitMQ } from '@facebluk/infra-rabbitmq'
import { Supabase } from '@facebluk/infra-supabase'
import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginCallback, RouteShorthandOptions } from 'fastify'
import { businessRuleErrorResponseSchema } from '../common'

export const rejectFriendRequestRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post<{ Body: Static<typeof bodySchema> }>(
    '/reject',
    routeOptions,
    async (request, reply) => {
      const jwt: Supabase.UserAuth.JwtModel = await request.jwtVerify()
      await CMD.RejectFriendRequest.handle(
        {
          id: request.id,
          friendRequestId: request.body.friendRequestId,
          userId: jwt.sub,
        },
        {
          es_rejectFriendRequest: PostgreSQL.FriendRequest.reject(request.postgreSqlPoolClient),
          es_findFriendRequestById: PostgreSQL.FriendRequest.findOneById(fastify.postgreSqlPool),
          int_processEvent: INT.Event.processEvent(
            RabbitMQ.publishEvent(request.rabbitMqChannel),
            PostgreSQL.Common.markEventAsSent(request.postgreSqlPoolClient)
          ),
        }
      )
      await reply.status(200).send()
    }
  )
  done()
}

const bodySchema = Type.Object({
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
