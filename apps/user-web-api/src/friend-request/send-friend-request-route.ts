import { CMD, INT } from '@facebluk/domain'
import { Common } from '@facebluk/infra-common'
import { PostgreSQL } from '@facebluk/infra-postgresql'
import { RabbitMQ } from '@facebluk/infra-rabbitmq'
import { Supabase } from '@facebluk/infra-supabase'
import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginCallback, RouteShorthandOptions } from 'fastify'
import { businessRuleErrorResponseSchema } from '../common'

export const sendFriendRequestRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post<{ Body: Static<typeof bodySchema> }>(
    '/send',
    routeOptions,
    async (request, reply) => {
      const jwt: Supabase.UserAuth.JwtModel = await request.jwtVerify()
      const pgClient = await fastify.postgreSqlPool.connect()
      const response = await CMD.SendFriendRequest.handle(
        {
          id: request.id,
          userId: jwt.sub,
          toUserId: request.body.toUserId,
        },
        {
          ua_findUserById: Supabase.UserAuth.User.findOneById(
            fastify.supabaseClient,
            Common.Logger.log(request.log),
            request.id
          ),
          es_findLastFriendRequestBetweenUsers:
            PostgreSQL.FriendRequest.findOneLastFriendRequestBetweenUsers(fastify.postgreSqlPool),
          es_findUserRelationship: PostgreSQL.UserRelationship.findOneBetweenUsers(
            fastify.postgreSqlPool
          ),
          es_sendFriendRequest: PostgreSQL.FriendRequest.send(pgClient),
          int_processEvent: INT.Event.processEvent(
            RabbitMQ.publishEvent(request.rabbitMqChannel),
            PostgreSQL.Common.markEventAsSent(request.postgreSqlPoolClient)
          ),
        }
      )
      await reply.status(200).send(response)
    }
  )
  done()
}

const bodySchema = Type.Object({
  toUserId: Type.String({ minLength: 1, format: 'uuid' }),
})

const responseSchema = {
  200: {
    type: 'object',
    properties: {
      friendRequestId: { type: 'string' },
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
