import { CMD, INT } from '@facebluk/domain'
import { Common } from '@facebluk/infra-common'
import { PostgreSQL } from '@facebluk/infra-postgresql'
import { RabbitMQ } from '@facebluk/infra-rabbitmq'
import { Supabase } from '@facebluk/infra-supabase'
import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginCallback, RouteShorthandOptions } from 'fastify'
import { businessRuleErrorResponseSchema } from '../common'

export const acceptFriendRequestRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post<{ Body: Static<typeof bodySchema> }>(
    '/accept',
    routeOptions,
    async (request, reply) => {
      const jwt: Supabase.UserAuth.JwtModel = await request.jwtVerify()
      await CMD.AcceptFriendRequest.handle(
        {
          id: request.id,
          userId: jwt.sub,
          friendRequestId: request.body.friendRequestId,
        },
        {
          es_transaction: PostgreSQL.Common.transaction(request.postgreSqlPoolClient),
          es_acceptFriendRequest: PostgreSQL.FriendRequest.accept(request.postgreSqlPoolClient),
          es_friendUser: PostgreSQL.UserRelationship.friend(request.postgreSqlPoolClient),
          es_findUserRelationshipBetween: PostgreSQL.UserRelationship.findOneBetweenUsers(
            fastify.postgreSqlPool
          ),
          es_findFriendRequest: PostgreSQL.FriendRequest.findOneById(fastify.postgreSqlPool),
          int_processEvents: INT.Event.processEvents(
            Common.Logger.log(request.log),
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
