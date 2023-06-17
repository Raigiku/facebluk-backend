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
          findUserRelationshipBetween: PostgreSQL.UserRelationship.findOneBetweenUsers(
            fastify.postgreSqlConn
          ),
          processEvent: INT.Event.processEvent(
            PostgreSQL.Common.persistEvent(fastify.postgreSqlConn),
            RabbitMQ.publishEvent(request.rabbitmqChannel),
            PostgreSQL.Common.markEventAsSent(fastify.postgreSqlConn)
          ),
          findUserById: Supabase.UserAuth.User.findOneById(
            fastify.supabaseConn,
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
