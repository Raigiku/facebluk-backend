import { CMD, INT } from '@facebluk/domain'
import { PostgreSQL } from '@facebluk/infra-postgresql'
import { RabbitMQ } from '@facebluk/infra-rabbitmq'
import { Supabase } from '@facebluk/infra-supabase'
import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginCallback, RouteShorthandOptions } from 'fastify'
import { businessRuleErrorResponseSchema } from '../common'

export const cancelFriendRequestRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post<{ Body: Static<typeof bodySchema> }>(
    '/cancel',
    routeOptions,
    async (request, reply) => {
      const jwt: Supabase.UserAuth.JwtModel = await request.jwtVerify()
      await CMD.CancelFriendRequest.handle(
        {
          id: request.id,
          friendRequestId: request.body.friendRequestId,
          userId: jwt.sub,
        },
        {
          findFriendRequestById: PostgreSQL.FriendRequest.findOneById(fastify.postgreSqlConn),
          processEvent: INT.Event.processEvent(
            PostgreSQL.Common.persistEvent(fastify.postgreSqlConn),
            RabbitMQ.publishEvent(request.rabbitmqChannel),
            PostgreSQL.Common.markEventAsSent(fastify.postgreSqlConn)
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
