import { CMD } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginCallback, RouteShorthandOptions } from 'fastify'
import { businessRuleErrorResponseSchema } from '../common'

export const blockUserRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post<{ Body: Static<typeof bodySchema> }>(
    '/block-user/v1',
    routeOptions,
    async (request, reply) => {
      const jwt: Infra.User.JwtModel = await request.jwtVerify()
      // await CMD.BlockUser.handle(
      //   {
      //     id: request.id,
      //     userId: jwt.sub,
      //     toUserId: request.body.toUserId,
      //   },
      //   {
      //     findUserById: Infra.User.findOneById(fastify.postgreSqlPool),
      //     findUserRelationshipBetween: Infra.UserRelationship.findOneBetweenUsers(
      //       fastify.postgreSqlPool
      //     ),
      //     publishEvent: Infra.Event.publishEvent(
      //       request.rabbitMqChannel,
      //       request.postgreSqlPoolClient
      //     ),
      //   }
      // )
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
