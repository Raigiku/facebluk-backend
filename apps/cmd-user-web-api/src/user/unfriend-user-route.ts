import { CMD } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginCallback, RouteShorthandOptions } from 'fastify'
import { businessRuleErrorResponseSchema } from '../common'

export const unfriendUserRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post<{ Body: Static<typeof bodySchema> }>(
    '/unfriend-user/v1',
    routeOptions,
    async (request, reply) => {
      const valRes = await CMD.UnfriendUser.validate(
        request.id,
        {
          toUserId: request.body.otherUserId,
          fromUserId: request.userAuthMetadata!.userId,
        },
        {
          findUserById: Infra.User.findOneById(fastify.postgreSqlPool),
          findRelationshipBetweenUsers: Infra.UserRelationship.findOneBetweenUsers(
            fastify.postgreSqlPool
          ),
        }
      )

      await Infra.Event.sendBrokerMsg(request.rabbitMqChannel)(request.id, CMD.UnfriendUser.id, {
        requestId: request.id,
        fromUserId: request.userAuthMetadata!.userId,
        toUserId: request.body.otherUserId,
        userRelationship: valRes.userRelationship,
      } as CMD.UnfriendUser.Request)

      await reply.status(200).send()
    }
  )
  done()
}

const bodySchema = Type.Object({
  otherUserId: Type.String({ minLength: 1, format: 'uuid' }),
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
