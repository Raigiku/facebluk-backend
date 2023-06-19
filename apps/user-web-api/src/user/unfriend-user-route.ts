import { CMD, INT } from '@facebluk/domain'
import { Common } from '@facebluk/infra-common'
import { PostgreSQL } from '@facebluk/infra-postgresql'
import { RabbitMQ } from '@facebluk/infra-rabbitmq'
import { Supabase } from '@facebluk/infra-supabase'
import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginCallback, RouteShorthandOptions } from 'fastify'
import { businessRuleErrorResponseSchema } from '../common'

export const unfriendUserRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post<{ Body: Static<typeof bodySchema> }>(
    '/unfriend',
    routeOptions,
    async (request, reply) => {
      const jwt: Supabase.UserAuth.JwtModel = await request.jwtVerify()
      await CMD.UnfriendUser.handle(
        {
          id: request.id,
          userId: jwt.sub,
          toUserId: request.body.toUserId,
        },
        {
          es_unfriend: PostgreSQL.UserRelationship.unfriend(request.postgreSqlPoolClient),
          es_findUserRelationshipBetween: PostgreSQL.UserRelationship.findOneBetweenUsers(
            fastify.postgreSqlPool
          ),
          int_processEvent: INT.Event.processEvent(
            RabbitMQ.publishEvent(request.rabbitMqChannel),
            PostgreSQL.Common.markEventAsSent(request.postgreSqlPoolClient)
          ),
          ua_findUserById: Supabase.UserAuth.User.findOneById(
            fastify.supabaseClient,
            Common.Logger.log(request.log),
            request.id
          ),
        }
      )
      await reply.status(200).send()
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
  },
  ...businessRuleErrorResponseSchema,
}

const routeOptions: RouteShorthandOptions = {
  schema: {
    body: bodySchema,
    response: responseSchema,
  },
}
